import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';
import { AuthDto, VerifyOtpDto } from './dtos/auth.dto';
import { Login } from './dtos/login.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private cloudinary: CloudinaryService,
    private mailService: MailService,   // 👈 إضافة خدمة الإيميل
  ) {}

  // ===============================
  // 🔵 Register
  // ===============================
  async register(authDto: AuthDto) {
    const { email, phone, name, type, zone, district, address, operations, hours, image } = authDto;

    if (!email && !phone) {
      throw new BadRequestException('Email or phone is required');
    }

    // check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      throw new ConflictException('User already exists, please login instead.');
    }

    // upload image if exists
    let uploadedImageUrl: string | null = null;

    if (image) {
      try {
        uploadedImageUrl = await this.cloudinary.uploadImageFromBase64(image, 'users');
      } catch (err) {
        throw new BadRequestException('Image upload failed: ' + err.message);
      }
    }

    // create user
    const user = await this.prisma.user.create({
      data: {
        name,
        email: email ?? null,
        phone: phone ?? null,
        type,
        image: uploadedImageUrl,
        phoneVerified: false,
      },
    });

    let market = {};

    // create market if OWNER
    if (type === 'OWNER') {
      market = await this.prisma.market.create({
        data: {
          name: authDto.marketName ?? `${name}'s Market`,
          ownerId: user.id,
          zone: zone ?? null,
          district: district ?? null,
          address: address ?? null,
          operations: operations ?? [],
          hours: hours ?? [],
        },
      });
    }

    // send OTP
    await this.sendOtp({ email, phone });

    return {
      message: 'User registered successfully. OTP sent.',
      user,
      market,
    };
  }


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
    await this.sendOtp({ email: user.email!, phone: user.phone! });

    return { message: `OTP sent to your phone/email` };
  }

  
  async sendOtp(authDto: { email?: string; phone?: string }) {
    const identifier = authDto.phone ?? authDto.email;

    if (!identifier) {
      throw new BadRequestException('Phone or email is required for OTP');
    }

    const otpCode = randomInt(10000, 99999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ phone: authDto.phone }, { email: authDto.email }] },
    });

    if (user) {
      await this.prisma.otp.deleteMany({ where: { userId: user.id } });
    }

    await this.prisma.otp.create({
      data: {
        code: otpCode,
        identifier,
        userId: user ? user.id : null,
        expiresAt,
      },
    });

    // // إرسال عبر الإيميل
    // if (authDto.email) {
    //   await this.mailService.sendOtpMail(authDto.email, otpCode);
    // }

    console.log(`OTP (${otpCode}) sent to ${identifier}`);

    return { message: `OTP sent successfully` };
  }

  // ===============================
  // 🔵 Verify OTP
  // ===============================
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

    await this.prisma.otp.delete({ where: { id: otpRecord.id } });

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: dto.phone ?? null }, { email: dto.email ?? null }],
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
}
