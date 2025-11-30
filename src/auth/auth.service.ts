// auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';
import { AuthDto, VerifyOtpDto, UpdateAddressDto, UpdateUserDto } from './dtos/auth.dto';
import { Login } from './dtos/login.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private cloudinary: CloudinaryService,
    private mailService: MailService,
  ) {}

  async register(authDto: AuthDto) {
    const { email, phone, name, type, zone, district, address, operations, hours, image } = authDto;

    if (!email && !phone) {
      throw new BadRequestException('Email or phone is required');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    let uploadedImageUrl: string | null = null;

    if (image) {
      uploadedImageUrl = await this.cloudinary.uploadImageFromBase64(image, 'users');
    }

    const defaultAddress = {
      type: 'HOME' as const,
      fullAddress: address ?? '',
      isSelected: true,
    };

    const user = await this.prisma.user.create({
      data: {
        name,
        email: email ?? null,
        phone: phone ?? null,
        type,
        image: uploadedImageUrl,
        phoneVerified: false,
        addresses: { create: defaultAddress },
      },
      include: { addresses: true },
    });

    let market = {};

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

    await this.sendOtp({ email, phone });

    return { message: 'User registered successfully', user, market };
  }

  async login(authDto: Login) {
    const { email, phone } = authDto;

    if (!email && !phone) {
      throw new BadRequestException('Email or phone is required');
    }

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
      include: { market: true, addresses: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.sendOtp({ email: user.email!, phone: user.phone! });

    return { message: 'OTP sent', user };
  }

  async sendOtp(authDto: { email?: string; phone?: string }) {
    const identifier = authDto.phone ?? authDto.email;

    if (!identifier) {
      throw new BadRequestException('Phone or email is required');
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
      data: { code: otpCode, identifier, userId: user ? user.id : null, expiresAt },
    });
console.log(otpCode);

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const identifier = dto.phone ?? dto.email;

    if (!identifier) {
      throw new BadRequestException('Phone or email is required');
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
      where: { OR: [{ phone: dto.phone ?? null }, { email: dto.email ?? null }] },
      include: { market: true, addresses: true },
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

async updateUser(userId: string, dto: UpdateUserDto) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { market: true } // لاحظ أننا شلنا addresses
  });

  if (!user) throw new NotFoundException('User not found');
  let uploadedImageUrl = user.image;

  if (dto.image) {
    uploadedImageUrl = await this.cloudinary.uploadImageFromBase64(
      dto.image,
      'users'
    );
  }

  await this.prisma.user.update({
    where: { id: userId },
    data: {
      name: dto.name ?? user.name,
      email: dto.email ?? user.email,
      phone: dto.phone ?? user.phone,
      image: uploadedImageUrl
    }
  });

  // =====================================================
  // 2) Update Market (ONLY if user.type === OWNER)
  // =====================================================
  if (user.type === 'OWNER') {
    if (user.market && dto.market) {
      let uploadedMarketImage = user.market.image;

      if (dto.market.image) {
        uploadedMarketImage = await this.cloudinary.uploadImageFromBase64(
          dto.market.image,
          'markets'
        );
      }

      await this.prisma.market.update({
        where: { id: user.market.id },
        data: {
          name: dto.market.name ?? user.market.name,
          zone: dto.market.zone ?? user.market.zone,
          district: dto.market.district ?? user.market.district,
          address: dto.market.address ?? user.market.address,
          operations: dto.market.operations ?? user.market.operations,
          hours: dto.market.hours ?? user.market.hours,
          image: uploadedMarketImage
        }
      });
    }
  } else {
    // 🚫 منع أي تعديل على الماركت لو مش Owner
    delete dto.market;
  }

  // ================================
  // 3) Return updated user
  // ================================
  const updatedUser = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { market: true,addresses:true } // شلنا addresses
  });

  return updatedUser;
}


async createAddress(userId: string, dto: UpdateAddressDto) {
    if (!dto.fullAddress) {
      throw new BadRequestException('fullAddress is required');
    }

    if (dto.isSelected) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isSelected: false }
      });
    }

    const address = await this.prisma.address.create({
      data: {
        type: dto.type ?? 'HOME',
        fullAddress: dto.fullAddress,
        isSelected: dto.isSelected ?? false,
        userId
      }
    });

    return { message: 'Address added', address };
  }

  async updateAddress(addressId: string, dto: UpdateAddressDto) {
    const address = await this.prisma.address.findUnique({ where: { id: addressId } });

    if (!address) throw new NotFoundException('Address not found');

    if (dto.isSelected) {
      await this.prisma.address.updateMany({
        where: { userId: address.userId },
        data: { isSelected: false }
      });
    }

    const updated = await this.prisma.address.update({
      where: { id: addressId },
      data: {
        type: dto.type ?? address.type,
        fullAddress: dto.fullAddress ?? address.fullAddress,
        isSelected: dto.isSelected ?? address.isSelected
      }
    });

    return { message: 'Address updated', updated };
  }

  async deleteAddress(addressId: string) {
    const address = await this.prisma.address.findUnique({ where: { id: addressId } });

    if (!address) throw new NotFoundException('Address not found');

    await this.prisma.address.delete({ where: { id: addressId } });

    return { message: 'Address deleted' };
  }

  async getUserAddresses(userId: string) {
    return await this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }
async deleteAllData() {
  return await this.prisma.$transaction(async (prisma) => {
    // حذف كل البيانات المرتبطة باليوزر
    await prisma.order.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.otp.deleteMany({});

    // أولاً نحذف كل المنتجات المرتبطة بكل market
    await prisma.product.deleteMany({});

    // بعد كده نحذف كل الأسواق
    await prisma.market.deleteMany({});

    // بعد كده العناوين واليوزر
    await prisma.address.deleteMany({});
    await prisma.user.deleteMany({});

    return { message: 'All user data has been deleted successfully.' };
  });
}


}