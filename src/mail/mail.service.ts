import { Injectable, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      // port: this.config.get('GMAIL_PORT'),
      // secure: this.config.get('GMAIL_PORT_SECURE'),
      auth: {
        user: this.config.get('EMAIL_USER'),
        pass: this.config.get('EMAIL_PASS'), // App Password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendOtpMail(email: string, otp: string) {
    try {
      await this.transporter.sendMail({
        from: `"Mini Market" <${this.config.get('EMAIL_USER')}>`,
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
      console.log(error);
      throw new BadRequestException('Failed to send email: ' + error.message);
    }
  }
}
