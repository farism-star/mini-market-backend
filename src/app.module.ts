import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { LoaderController } from './loader.controller';
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
import { PaymentModule } from './payments/payment.module';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from './upload/multer.config';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false, 
      },
    }),

    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TwilioModule,
    ProductModule,
    CategoryModule,
    MarketModule,
    OrdersModule,
    MulterModule.register(multerConfig),
    PaymentModule,
    SocketModule,
    ConversationModule,
    NotificationModule,
    MessageModule,
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [AppController,LoaderController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserCheckMiddleware)
      .exclude(
        { path: 'v1/auth/login', method: RequestMethod.POST },
        { path: 'v1/auth/admin/owners', method: RequestMethod.GET },
        { path: 'v1/categories', method: RequestMethod.GET },
        { path: 'v1/auth/admin/clients', method: RequestMethod.GET },
        { path: 'v1/auth/admin/markets', method: RequestMethod.GET },
        { path: 'v1/auth/register', method: RequestMethod.POST },
        { path: 'v1/auth/admin/login', method: RequestMethod.POST },
        { path: 'v1/auth/add-admin', method: RequestMethod.POST },
        { path: 'v1/auth/delete-users', method: RequestMethod.DELETE },
        { path: 'v1/messages/delete-all', method: RequestMethod.DELETE },
        { path: 'v1/auth/delete-all-data', method: RequestMethod.DELETE },
        { path: 'v1/orders/delete-all', method: RequestMethod.DELETE },
        { path: 'v1/auth/verify-otp', method: RequestMethod.POST },
        { path: 'v1/twilio/send-sms', method: RequestMethod.POST },
        { path: 'uploads/(.*)', method: RequestMethod.GET }
      )
      .forRoutes('*');
  }
}