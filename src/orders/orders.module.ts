import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from 'src/notifications/notification.service';
import { NotificationModule } from 'src/notifications/notification.module';

@Module({
  imports:[NotificationModule],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService,NotificationService],
  exports: [OrdersService],
})
export class OrdersModule {}
