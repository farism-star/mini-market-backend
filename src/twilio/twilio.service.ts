import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio'; // ✅ استيراد كامل

@Injectable()
export class TwilioService {
  private client: Twilio.Twilio;
  private from: string;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID')!;
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN')!;
    this.from = this.configService.get<string>('TWILIO_PHONE_NUMBER')!;

    this.client = Twilio(accountSid, authToken); // ✅ استدعاء الكلاس بشكل صحيح
  }

  async sendSms(to: string, message: string): Promise<void> {
    try {
      await this.client.messages.create({
        body: message,
        from: this.from,
        to,
      });
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new InternalServerErrorException('Failed to send SMS');
    }
  }
}
