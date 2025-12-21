import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { NotificationService } from '../notifications/notification.service';
import { formatTimeToAMPM, buildOrderBanarMessage, buildOrderMessage } from '../helpers/helper';
import { FirebaseService } from '../firbase/firebase.service';
import { RateOrderDto } from './dtos/rate-order.dto';

type AuthUser = { id: string; type: string };

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
    private firebaseService: FirebaseService,
  ) { }

  async create(createDto: CreateOrderDto, user?: AuthUser) {
    const data: any = { ...createDto };
  
    if (user && user.type === 'CLIENT') {
      data.clientId = user.id;
    }
  
    if (!data.orderId) {
      data.orderId = `ORD-${Date.now()}`;
    }
  
    if (!data.deliveryId) {
      data.deliveryId = null;
    }
  
    const order = await this.prisma.order.create({
      data,
      include: { market: true, client: true },
    });
  
    // إرسال FCM notification مع error handling
    if (order.client?.fcmToken) {
      try {
        await this.firebaseService.sendNotification(
          order.client.fcmToken,
          'تم إنشاء الطلب',
          `تم استلام طلبك رقم ${order.orderId} بنجاح، وجاري العمل على تجهيزه.`,
          {
            orderId: order.id,
            status: order.status,
          },
        );
      } catch (error) {
        console.error('Failed to send FCM notification:', error.message);
        
        // حذف الـ token إذا كان invalid
        if (error.code === 'messaging/registration-token-not-registered' || 
            error.code === 'messaging/invalid-registration-token') {
          await this.prisma.user.update({
            where: { id: order.clientId ?? '' },
            data: { fcmToken: null },
          });
          console.log(`❌ Removed invalid FCM token for user ${order.clientId}`);
        }
      }
    }
  
    // إرسال رسالة BANNER للمحادثة + Notification
    if (order.clientId && order.market?.ownerId) {
      try {
        const conversation = await this.prisma.conversation.findFirst({
          where: {
            users: { hasEvery: [order.clientId, order.market.ownerId] },
          },
        });
  
        if (conversation) {
          // إرسال رسالة BANNER
          await this.prisma.message.create({
            data: {
              conversationId: conversation.id,
              senderId: order.clientId,
              type: 'BANAR',
              text: buildOrderMessage(order),
              isRead: false,
            },
          });
  
          // إرسال Notification لصاحب السوق
          await this.notification.create({
            userId: order.market.ownerId,
            body: buildOrderBanarMessage(order),
          });
        }
      } catch (error) {
        console.error('Failed to send banner message or notification:', error.message);
        // لا نرمي الخطأ حتى لا نؤثر على إنشاء الطلب
      }
    }
  
    return {
      ...order,
      time: order.time ? formatTimeToAMPM(order.time) : null,
    };
  }
  async findAll(user?: AuthUser, search?: string) {
    if (!user) return [];

    const searchCondition = search ? {
      OR: [
        { orderId: { contains: search, mode: 'insensitive' } },
        { market: { nameAr: { contains: search, mode: 'insensitive' } } },
        { market: { nameEn: { contains: search, mode: 'insensitive' } } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
      ]
    } : {};

    let whereClause: any = {};

    if (user.type === 'CLIENT') {
      whereClause = { clientId: user.id, ...searchCondition };
    } else if (user.type === 'OWNER') {
      whereClause = { market: { ownerId: user.id }, ...searchCondition };
    } else {
      // ADMIN
      whereClause = { ...searchCondition };
    }

    const orders = await this.prisma.order.findMany({
      where: whereClause,
      include: { market: true, client: true, delivery: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => ({
      ...order,
      time: order.time ? formatTimeToAMPM(order.time) : null,
    }));
  }

  async rateOrder(id: string, rateDto: RateOrderDto, user?: AuthUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { market: true, client: true },
    });
  
    if (!order) throw new NotFoundException('Order not found');
    if (!user) throw new ForbiddenException('Unauthorized');
  
    // التحقق من أن العميل هو من يقيم طلبه فقط
    if (user.type === 'CLIENT' && order.clientId !== user.id) {
      throw new ForbiddenException('You can only rate your own orders');
    }
  
    // التحقق من أن الطلب مكتمل قبل التقييم
    if (order.status !== 'COMPLETED') {
      throw new BadRequestException('You can only rate completed orders');
    }
  
    // التحقق من عدم وجود تقييم سابق (rate > 0 يعني تم التقييم)
    if (order.rate > 0) { // ⬅️ تغيير هنا
      throw new BadRequestException('This order has already been rated');
    }
  
    // التحقق من أن التقييم لا يقل عن 1
    if (rateDto.rate < 1) { // ⬅️ إضافة هنا
      throw new BadRequestException('Rating must be at least 1 star');
    }
  
    const updated = await this.prisma.order.update({
      where: { id },
      data: { 
        rate: rateDto.rate,
        hasRate: true, // ⬅️ تحديث hasRate
      },
      include: { market: true, client: true, delivery: true },
    });
  
    // إرسال إشعار للسوق/المالك عن التقييم
    if (order.market?.ownerId) {
      await this.notification.create({
        userId: order.market.ownerId,
        body: `تم تقييم طلبك رقم ${order.orderId} بـ ${rateDto.rate} نجوم`,
      });
    }
  
    return {
      ...updated,
      time: updated.time ? formatTimeToAMPM(updated.time) : null,
    };
  }
  async findOne(id: string, user?: AuthUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { market: true, client: true, delivery: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (!user) throw new ForbiddenException('Unauthorized');

    if (user.type === 'CLIENT' && order.clientId !== user.id) {
      throw new ForbiddenException('You can only view your own orders');
    }

    if (user.type === 'OWNER') {
      if (!order.market || order.market.ownerId !== user.id) {
        throw new ForbiddenException('You can only view orders for your market');
      }
    }

    return {
      ...order,
      time: order.time ? formatTimeToAMPM(order.time) : null,
    };
  }



  async update(id: string, dto: UpdateOrderDto, user?: AuthUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { market: true, client: true },
    });
  
    if (!order) throw new NotFoundException('Order not found');
    if (!user) throw new ForbiddenException('Unauthorized');
  
    const oldStatus = order.status;
  
    const updated = await this.prisma.order.update({
      where: { id },
      data: dto,
      include: { market: true, client: true, delivery: true },
    });
  
    const statusMap = {
      IN_PROGRESS: 'قيد المراجعة',
      COMPLETED: 'مكتمل',
      DECLINE: 'ملغي',
    };
  
    if (dto.status && oldStatus !== dto.status) {
      if (updated.client?.fcmToken) {
        try {
          await this.firebaseService.sendNotification(
            updated.client.fcmToken,
            'تحديث حالة الطلب',
            `نود إعلامك بأن حالة طلبك رقم ${updated.orderId} قد تم تحديثها من ${statusMap[oldStatus]} إلى ${statusMap[dto.status]}.`,
            {
              orderId: updated.id,
              oldStatus,
              newStatus: dto.status,
            },
          );
        } catch (error) {
          if (error.code === 'messaging/registration-token-not-registered' || 
              error.code === 'messaging/invalid-registration-token') {
            await this.prisma.user.update({
              where: { id: updated.clientId ?? '' },
              data: { fcmToken: null },
            });
          }
        }
      }
  
      // حساب الرسوم عند تحديث الطلب لـ COMPLETED
      if (dto.status === 'COMPLETED' && updated.marketId) {
        await this.updateMarketFees(updated.marketId);
      }
    }
  
    return {
      ...updated,
      time: updated.time ? formatTimeToAMPM(updated.time) : null,
    };
  }
  
  private async updateMarketFees(marketId: string) {
    try {
      const market = await this.prisma.market.findUnique({
        where: { id: marketId },
        select: {
          id: true,
          currentFees: true,
          limitFees: true,
          feePerOrder: true,
          ownerId: true,
        },
      });
  
      if (!market) return;
  
      // زيادة عدد الطلبات المكتملة
      const newCurrentFees = (market.currentFees || 0) + (market.feePerOrder || 0);
      
      // التحقق من الوصول للحد الأقصى
      const isFeesRequired = newCurrentFees >= (market.limitFees || 0);
  
      await this.prisma.market.update({
        where: { id: marketId },
        data: {
          currentFees: newCurrentFees,
        },
      });
  
      await this.prisma.user.update({
        where: { id: market.ownerId },
        data: {
          isFeesRequired: isFeesRequired,
        },
      });
  
      if (isFeesRequired) {
        await this.notification.create({
          userId: market.ownerId,
          body: `تنبيه: لقد وصلت الرسوم المستحقة إلى ${newCurrentFees} ريال من أصل ${market.limitFees} ريال. يرجى سداد الرسوم.`,
        });
      }
    } catch (error) {
      // تجاهل الأخطاء
    }
  }

  async remove(id: string, user?: AuthUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { market: true, client: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (!user) throw new ForbiddenException('Unauthorized');

    if (user.type !== 'ADMIN' && (user.type !== 'OWNER' || order.market?.ownerId !== user.id)) {
      throw new ForbiddenException('You do not have permission to delete this order');
    }

    try {
      await this.prisma.order.delete({ where: { id } });

      if (order.clientId) {
        await this.notification.create({
          userId: order.clientId,
          body: `Your order (${order.orderId}) was deleted`,
        });
      }

      return { success: true };
    } catch (err) {
      throw new BadRequestException(err?.message || 'Failed to delete order');
    }
  }


  async removeAll() {
    await this.prisma.order.deleteMany({});
  }
}
