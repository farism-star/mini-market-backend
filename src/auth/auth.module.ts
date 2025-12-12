import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { TwilioModule } from 'src/twilio/twilio.module';

import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    MailModule,
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey', // السر
      signOptions: { expiresIn: '7d' },             // مدة صلاحية التوكن
    }),
    TwilioModule
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
