import { Controller, Post, Body } from '@nestjs/common';
import { TwilioService } from './twilio.service';

@Controller('twilio')
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  @Post('send-sms')
  async sendSms(@Body() body: { to: string; message: string }) {
    const { to, message } = body;

    await this.twilioService.sendSms(to, message);
    return { message: 'SMS sent successfully' };
  }
}
