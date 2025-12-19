import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { TwilioModule } from 'src/twilio/twilio.module';

import { MailModule } from 'src/mail/mail.module';
import { FirebaseService } from '../firbase/firebase.service';
import { FirebaseModule } from 'src/firbase/firebase.module';

@Module({
  imports: [
    MailModule,
    PrismaModule,
    FirebaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey', 
      signOptions: { expiresIn: '7d' },            
    }),
    TwilioModule
  ],
  providers: [AuthService, JwtStrategy,FirebaseService],
  controllers: [AuthController],
})
export class AuthModule {}
