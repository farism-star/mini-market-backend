import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from 'src/notifications/notification.service';
import { NotificationModule } from 'src/notifications/notification.module';
import { FirebaseService } from '../firbase/firebase.service';
import { FirebaseModule } from 'src/firbase/firebase.module';
@Module({
  imports:[NotificationModule,FirebaseModule],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService,NotificationService,FirebaseService],
  exports: [OrdersService],
})
export class OrdersModule {}
