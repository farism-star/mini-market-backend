import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TwilioService } from './twilio.service';
import { TwilioController } from './twilio.controller';

@Module({
  imports: [ConfigModule],
  controllers:[TwilioController],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioModule {}
