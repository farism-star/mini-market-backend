import { Injectable, BadRequestException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailer: MailerService) {}

  async sendOtpMail(email: string, otp: string) {
    try {
      await this.mailer.sendMail({
        to: email,
        subject: 'Your OTP Code',
        html: `
          <h2>Your Verification Code</h2>
          <p style="font-size:18px; font-weight:bold;">${otp}</p>
          <p>This code will expire in 5 minutes.</p>
        `,
      });

      return { message: 'OTP email sent successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to send email: ' + error.message);
    }
  }
}
