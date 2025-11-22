import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { isValidObjectId } from 'mongoose';
import { NotificationGateway } from '../socket/notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationGateway
  ) {}

  async create(dto: CreateNotificationDto) {
    const { userId, body } = dto;

    if (!isValidObjectId(userId)) throw new BadRequestException('Invalid userId format');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const notification = await this.prisma.notification.create({ data: { userId, body } });

    this.gateway.sendNotificationToUser(userId, notification);

    return { message: 'Notification created', notification };
  }

  async update(id: string, body: string) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid notificationId');

    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { body },
    });

    this.gateway.sendNotificationToUser(notification.userId, updated);

    return { message: 'Notification updated', notification: updated };
  }

  async getUserNotifications(userId: string) {
    if (!isValidObjectId(userId)) throw new BadRequestException('Invalid userId');

    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid notificationId');

    const exists = await this.prisma.notification.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Notification not found');

    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllAsRead(userId: string) {
    if (!isValidObjectId(userId)) throw new BadRequestException('Invalid userId');

    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: string) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid notificationId');

    const exists = await this.prisma.notification.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Notification not found');

    await this.prisma.notification.delete({ where: { id } });
    return { message: 'Notification deleted' };
  }
}

