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
  
    if (order.client?.fcmToken) {
      await this.firebaseService.sendNotification(
        order.client.fcmToken,
        'تم إنشاء الطلب',
        `تم استلام طلبك رقم ${order.orderId} بنجاح، وجاري العمل على تجهيزه.`,
        {
          orderId: order.id,
          status: order.status,
        },
      );
    }
  
    // إرسال رسالة BANNER للمحادثة + Notification
    if (order.clientId && order.market?.ownerId) {
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
  
    // التحقق من عدم وجود تقييم سابق
    if (order.rate !== null && order.rate !== undefined) {
      throw new BadRequestException('This order has already been rated');
    }
  
    const updated = await this.prisma.order.update({
      where: { id },
      data: { 
        rate: rateDto.rate,
        // إذا كان لديك حقل comment في قاعدة البيانات
        // rateComment: rateDto.comment 
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

    if (updated.client?.fcmToken && dto.status && oldStatus !== dto.status) {
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
    }

    return {
      ...updated,
      time: updated.time ? formatTimeToAMPM(updated.time) : null,
    };
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
