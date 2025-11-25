import { Injectable, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;

  constructor(private config: ConfigService) {

    console.log('EMAIL_USER:', this.config.get('EMAIL_USER'));
    console.log('EMAIL_PASS exists:', !!this.config.get('EMAIL_PASS'));
    
    this.transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: this.config.get('EMAIL_USER'),
        pass: this.config.get('EMAIL_PASS'),
      },
   
    });
  }

  async sendOtpMail(email: string, otp: string) {
    try {
      // Test connection أول
      await this.transporter.verify();
      console.log('SMTP connection verified');

      const info = await this.transporter.sendMail({
        from: `"Mini Market" <${this.config.get('EMAIL_USER')}>`,
        to: email,
        subject: 'Your OTP Code',
        html: `
          <h2>Your Verification Code</h2>
          <p style="font-size:18px; font-weight:bold;">${otp}</p>
          <p>This code will expire in 5 minutes.</p>
        `,
      });

      console.log('Email sent successfully:', info.messageId);
      return { message: 'OTP email sent successfully' };
    } catch (error) {
      console.error('Email Error Details:', error);
      throw new BadRequestException('Failed to send email: ' + error.message);
    }
  }
}