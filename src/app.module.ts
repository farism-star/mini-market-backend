import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TwilioModule } from './twilio/twilio.module';
import { ProductModule } from './produts/product.module';
import { CategoryModule } from './category/category.module';
import { UserCheckMiddleware } from './common/middelwares/UserCheckMiddleware ';
import { JwtModule } from '@nestjs/jwt';
import { MarketModule } from './market/market.module';
import { OrdersModule } from './orders/orders.module';
import { SocketModule } from './socket/socket.module';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { NotificationModule } from './notifications/notification.module';
import { MailerModule } from '@nestjs-modules/mailer';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    PrismaModule,
    AuthModule,
    TwilioModule,
    ProductModule,
    CategoryModule,
    MarketModule,
    OrdersModule,
    SocketModule,
    ConversationModule,
    NotificationModule,
    MessageModule,
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserCheckMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register', method: RequestMethod.POST },
        { path: 'auth/verify-otp', method: RequestMethod.POST },
        { path: 'twilio/send-sms', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
