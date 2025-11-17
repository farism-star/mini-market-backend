import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';

type AuthUser = { id: string; type: string }; // adjust type name if you have UserType

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}


  async create(createDto: CreateOrderDto, user?: AuthUser) {
    try {
      const data: any = { ...createDto };

      // If user is client and no clientId passed, set it
      if (user && user.type === 'CLIENT') {
        data.clientId = user.id;
      }
    

      // Optional: generate orderId if not provided
      if (!data.orderId) {
        data.orderId = `ORD-${Date.now()}`; // simple unique generator: change if you want more robust
      }

      const order = await this.prisma.order.create({
        data,
        include: {
          market: true,
          client: true,
        },
      });

      return order;
    } catch (err) {
      // Prisma errors bubble here; wrap in BadRequestException for simplicity
      throw new BadRequestException(err?.message || 'Failed to create order');
    }
  }


  async findAll(user?: AuthUser) {
   
    if (!user) return [];

    if (user.type === 'CLIENT') {
      return this.prisma.order.findMany({
        where: { clientId: user.id },
        include: { market: true, client: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (user.type === 'OWNER') {
      // find orders whose market's ownerId is the user.id
      return this.prisma.order.findMany({
        where: {
          market: {
            ownerId: user.id,
          },
        },
        include: { market: true, client: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    // default (admin or others) => all orders
    return this.prisma.order.findMany({
      include: { market: true, client: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find single order by id, but check permission: client can read own order, owner can read if owns the market.
   */
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
      // ensure owner of the market
      if (!order.market || order.market.ownerId !== user.id) {
        throw new ForbiddenException('You can only view orders for your market');
      }
    }

    return order;
  }

 
  async update(id: string, dto: UpdateOrderDto, user?: AuthUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { market: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (!user) throw new ForbiddenException('Unauthorized');

    // enforce owner-only update (as you requested)
    if (user.type !== 'OWNER' || order.market?.ownerId !== user.id) {
      throw new ForbiddenException('Only the owner of the market can modify this order');
    }

    try {
      const updated = await this.prisma.order.update({
        where: { id },
        data: dto,
        include: { market: true, client: true },
      });
      return updated;
    } catch (err) {
      throw new BadRequestException(err?.message || 'Failed to update order');
    }
  }

  /**
   * Remove order.
   * Only owner of the market can delete orders of his market (mirrors update policy).
   */
  async remove(id: string, user?: AuthUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { market: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (!user) throw new ForbiddenException('Unauthorized');

    if (user.type !== 'OWNER' || order.market?.ownerId !== user.id) {
      throw new ForbiddenException('Only the owner can delete this order');
    }

    try {
      await this.prisma.order.delete({ where: { id } });
      return { success: true };
    } catch (err) {
      throw new BadRequestException(err?.message || 'Failed to delete order');
    }
  }
}
