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

type AuthUser = { id: string; type: string };

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
  ) { }

  async create(createDto: CreateOrderDto, user?: AuthUser) {
    try {
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

      // إشعارات للمالك والعميل
      if (order.market?.ownerId) {
        await this.notification.create({
          userId: order.market.ownerId,
          body: `New order (${order.orderId}) from ${order.client?.name ?? 'a customer'}`,
        });
      }

      if (order.clientId) {
        await this.notification.create({
          userId: order.clientId,
          body: `Your order (${order.orderId}) has been created successfully`,
        });
      }

      // إيجاد أو إنشاء Conversation بين العميل وOwner
      let conversation = await this.prisma.conversation.findFirst({
        where: {
          AND: [
            { users: { has: order.clientId } },
            { users: { has: order.market?.ownerId } },
          ],
        },
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            users: [order.clientId!, order.market!.ownerId!],
          },
        });
      }

      // إنشاء BANAR message باستخدام الدالة من الـ helper
      await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: order.market!.ownerId!,
          type: 'BANAR',
          text: buildOrderBanarMessage(order),
        },
      });

      await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: order.market!.ownerId!,
          type: 'TEXT',
          text: buildOrderMessage(order),
        },
      });

      return {
        ...order,
        time: order.time ? formatTimeToAMPM(order.time) : null,
      };
    } catch (err) {
      throw new BadRequestException(err?.message || 'Failed to create order');
    }
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
  async findOne(id: string, user?: AuthUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { market: true, client: true,delivery:true },
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

    // ... (منطق التحقق من الصلاحيات)

    // حفظ الحالة القديمة والحالة الجديدة المحتملة للمقارنة
    const oldStatus = order.status;
    const newStatus = dto.status;

    // تحديد ما إذا كان هناك تغيير في الحالة من/إلى COMPLETED
    const completedToOther = oldStatus === 'COMPLETED' && newStatus !== 'COMPLETED';
    const otherToCompleted = oldStatus !== 'COMPLETED' && newStatus === 'COMPLETED';

    try {
      const updated = await this.prisma.order.update({
        where: { id },
        data: dto,
        include: { market: true, client: true,delivery:true },
      });

      // ==========================================================
      // منطق تحديث الرسوم المالية بناءً على تغيير الحالة
      // ==========================================================
      if (updated.market) {
        const marketId = updated.market.id;
        const ownerId = updated.market.ownerId;
        const feePerOrder = updated.market.feePerOrder || 0;
        const currentFees = updated.market.currentFees || 0; // القيمة الحالية قبل التغيير في هذه العملية

        let newFees = currentFees;
        let shouldUpdateFees = false;

        // 1. الانتقال من أي حالة إلى COMPLETED (إضافة الرسوم)
        if (otherToCompleted) {
          newFees += feePerOrder;
          shouldUpdateFees = true;
        }
        // 2. الانتقال من COMPLETED إلى أي حالة أخرى (خصم الرسوم)
        else if (completedToOther) {
          // نستخدم Math.max(0, ...) لضمان أن الرسوم الجديدة لا تقل عن الصفر
          newFees = Math.max(0, currentFees - feePerOrder);
          shouldUpdateFees = true;
        }

        // إذا حدث تغيير في الرسوم
        if (shouldUpdateFees) {
          // تحديث currentFees للماركت بالقيمة الجديدة المحسوبة
          let updatedMarket = await this.prisma.market.update({
            where: { id: marketId },
            data: {
              currentFees: newFees, // نستخدم القيمة المطلقة المحسوبة (newFees) بدلاً من increment
            },
          });

          // 3. تحديث حالة المالك (isFeesRequired) بناءً على currentFees الجديدة

          // تحديد قيمة isFeesRequired الجديدة
          let newIsFeesRequired = false;
          if (updatedMarket.currentFees && updatedMarket.limitFees) {
            newIsFeesRequired = updatedMarket.currentFees >= updatedMarket.limitFees;
          }

          // جلب بيانات المالك للتحقق من حالته الحالية
          const owner = await this.prisma.user.findUnique({
            where: { id: ownerId },
            select: { isFeesRequired: true } // جلب الحقل المطلوب فقط
          });

          // إذا كانت الحالة الجديدة تختلف عن الحالة الحالية للمالك، قم بالتحديث
          if (owner && owner.isFeesRequired !== newIsFeesRequired) {
            await this.prisma.user.update({
              where: { id: ownerId },
              data: {
                isFeesRequired: newIsFeesRequired, // تحديث طلب الرسوم
              },
            });
          }
        }
      }
      // ==========================================================
      // نهاية منطق تحديث الرسوم المالية
      // ==========================================================


      if (updated.clientId) {
        await this.notification.create({
          userId: updated.clientId,
          body: `Your order (${updated.orderId}) status is now: ${updated.status}`,
        });
      }

      return {
        ...updated,
        time: updated.time ? formatTimeToAMPM(updated.time) : null,
      };
    } catch (err) {
      throw new BadRequestException(err?.message || 'Failed to update order');
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
