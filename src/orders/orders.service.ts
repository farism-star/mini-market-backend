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
import { formatTimeToAMPM } from '../helpers/helper';

type AuthUser = { id: string; type: string };

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
  ) {}

  async create(createDto: CreateOrderDto, user?: AuthUser) {
    try {
      const data: any = { ...createDto };

      if (user && user.type === 'CLIENT') {
        data.clientId = user.id;
      }

      if (!data.orderId) {
        data.orderId = `ORD-${Date.now()}`;
      }

      const order = await this.prisma.order.create({
        data,
        include: { market: true, client: true },
      });

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

      return {
        ...order,
        time: order.time ? formatTimeToAMPM(order.time) : null,
      };
    } catch (err) {
      throw new BadRequestException(err?.message || 'Failed to create order');
    }
  }

  async findAll(user?: AuthUser) {
    if (!user) return [];

    let orders: any[] = [];

    if (user.type === 'CLIENT') {
      orders = await this.prisma.order.findMany({
        where: { clientId: user.id },
        include: { market: true, client: true },
        orderBy: { createdAt: 'desc' },
      });
    } else if (user.type === 'OWNER') {
      orders = await this.prisma.order.findMany({
        where: { market: { ownerId: user.id } },
        include: { market: true, client: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      orders = await this.prisma.order.findMany({
        include: { market: true, client: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return orders.map(order => ({
      ...order,
      time: order.time ? formatTimeToAMPM(order.time) : null,
    }));
  }

  async findOne(id: string, user?: AuthUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { market: true, client: true },
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
      timeFormatted: order.time ? formatTimeToAMPM(order.time) : null,
    };
  }

  async update(id: string, dto: UpdateOrderDto, user?: AuthUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { market: true, client: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (!user) throw new ForbiddenException('Unauthorized');

    if (user.type !== 'OWNER' || order.market?.ownerId !== user.id) {
      throw new ForbiddenException('Only the owner of the market can modify this order');
    }

    try {
      const updated = await this.prisma.order.update({
        where: { id },
        data: dto,
        include: { market: true, client: true },
      });

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

    if (user.type !== 'OWNER' || order.market?.ownerId !== user.id) {
      throw new ForbiddenException('Only the owner can delete this order');
    }

    try {
      await this.prisma.order.delete({ where: { id } });

      if (order.clientId) {
        await this.notification.create({
          userId: order.clientId,
          body: `Your order (${order.orderId}) was deleted by the market owner`,
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
