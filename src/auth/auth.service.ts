import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';
import { AuthDto, VerifyOtpDto } from './dtos/auth.dto';
import { TwilioService } from '../twilio/twilio.service';
import { Login } from './dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private twilioService: TwilioService,
  ) {}

  // ✅ Registration endpoint
  async register(authDto: AuthDto) {
    const { email, phone, name, type } = authDto;

    if (!email && !phone) {
      throw new BadRequestException('Email or phone is required');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      return { message: 'User already exists, please login instead.' };
    }

    const user = await this.prisma.user.create({
      data: {
        name,
        email: email ?? null,
        phone: phone ?? null,
        type,
        phoneVerified: false,
      },
    });

    // إرسال OTP
    await this.sendOtp(authDto);

    return { message: 'User registered. OTP sent to phone/email.', user };
  }

  // ✅ Login endpoint
 async login(authDto: Login) {
  const { email, phone } = authDto;

  if (!email && !phone) {
    throw new BadRequestException('Email or phone is required');
  }

  const user = await this.prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });

  if (!user) {
    throw new UnauthorizedException('User not found. Please register first.');
  }

  // إرسال OTP
 const datamessage = await this.sendOtp(authDto);

  return { message: `OTP sent to your phone/email` };
}


  // ✅ إرسال OTP
  async sendOtp(authDto: { email?: string; phone?: string }) {
  const identifier = authDto.phone ?? authDto.email;

  if (!identifier) {
    throw new BadRequestException('Phone or email is required for OTP');
  }

const otpCode = randomInt(10000, 99999).toString();
console.log(otpCode);

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  const user = await this.prisma.user.findFirst({
    where: { OR: [{ phone: authDto.phone }, { email: authDto.email }] },
  });

  // حذف OTP قديم
  if (user) {
    await this.prisma.otp.deleteMany({ where: { userId: user.id } });
  }

  // إنشاء OTP جديد
  await this.prisma.otp.create({
    data: {
      code: otpCode,
      identifier,
      userId: user ? user.id : null,
      expiresAt,
    },
  });

  // إرسال SMS لو رقم
  if (authDto.phone) {
    try {
      await this.twilioService.sendSms(
        authDto.phone,
        `Your OTP is: ${otpCode}`,
      );
    } catch (error) {
      // 🔥 هندلة أخطاء Twilio
      if (error.code === 21608) {
        throw new BadRequestException(
          'This phone number is not verified in Twilio Trial. Please verify it first.',
        );
      }

      if (error.code === 21211) {
        throw new BadRequestException('Invalid phone number format.');
      }

      if (error.code === 30003) {
        throw new BadRequestException(
          'SMS delivery failed — the message was rejected.',
        );
      }

      if (error.code === 30007) {
        throw new BadRequestException(
          'Carrier blocked this SMS (SMS Filtering / Spam).',
        );
      }

      // fallback لأي خطأ آخر
      throw new BadRequestException(
        `Failed to send OTP: ${error.message || 'Unknown error'}`,
      );
    }
  } else {
    // في حالة الإيميل
    console.log(`OTP for ${identifier}: ${otpCode}`);
  }

  return { message: `OTP sent successfully.: ${otpCode}` };
}


  // ✅ التحقق من OTP
 async verifyOtp(dto: VerifyOtpDto) {
  const identifier = dto.phone ?? dto.email;

  if (!identifier) {
    throw new BadRequestException('Phone or email is required for verification');
  }

  const otpRecord = await this.prisma.otp.findFirst({
    where: { identifier },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRecord) {
    throw new UnauthorizedException('OTP not found');
  }

  if (new Date() > otpRecord.expiresAt) {
    await this.prisma.otp.delete({ where: { id: otpRecord.id } });
    throw new UnauthorizedException('OTP expired');
  }

  if (otpRecord.code !== dto.otp) {
    throw new UnauthorizedException('Invalid OTP');
  }

  // delete OTP
  await this.prisma.otp.delete({ where: { id: otpRecord.id } });

  // find user with phone or email
  const user = await this.prisma.user.findFirst({
    where: {
      OR: [
        { phone: dto.phone ?? null },
        { email: dto.email ?? null },
      ],
    },
  });

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  await this.prisma.user.update({
    where: { id: user.id },
    data: { phoneVerified: true },
  });

  const token = this.jwtService.sign({ sub: user.id, type: user.type });

  return { token, user };
}


  // ✅ استرجاع المستخدم من JWT
  async getUserFromToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return await this.prisma.user.findUnique({ where: { id: payload.sub } });
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
