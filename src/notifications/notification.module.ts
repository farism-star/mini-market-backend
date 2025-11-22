import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationGateway } from 'src/socket/notification.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule,JwtModule.register({
      secret: process.env.JWT_SECRET,
    })],
  controllers: [NotificationController],
  providers: [NotificationService,NotificationGateway],
  exports: [NotificationService,NotificationGateway],
})
export class NotificationModule {}
