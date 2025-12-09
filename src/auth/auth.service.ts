// auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';
import { AuthDto, VerifyOtpDto, UpdateAddressDto, UpdateUserDto } from './dtos/auth.dto';
import { Login } from './dtos/login.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { MailService } from 'src/mail/mail.service';
import { AddAdminDto } from './dtos/add-admin.dto';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private cloudinary: CloudinaryService,
    private mailService: MailService,
  ) { }

  async register(dto: AuthDto, imageUrl: string | null) {
    const { email, phone, name, type, zone, district, address, operations, hours } = dto;
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      throw new ConflictException('User already exists with this email or phone');
    }
    const user = await this.prisma.user.create({
      data: {
        name,
        email: email ?? null,
        phone: phone ?? null,
        type,
        image: imageUrl,       // ← الصورة من multer
        phoneVerified: false,
        addresses: {
          create: {
            type: 'HOME',
            fullAddress: address ?? '',
            isSelected: true,
          },
        },
      },
      include: { addresses: true },
    });

    let market = {};

    if (type === 'OWNER') {
      market = await this.prisma.market.create({
        data: {
          name: dto.marketName ?? `${name}'s Market`,
          ownerId: user.id,
          zone,
          district,
          address,
          operations: operations ?? [],
          hours: hours ?? [],
        },
      });
    }

    await this.sendOtp({ email, phone });

    return { message: 'User registered successfully', user, market };
  }
  async addAdmin(dto: AddAdminDto) {
    const { email, name, password } = dto;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    // تأكد إن ما فيش Admin أصلاً
    const existingAdmin = await this.prisma.userDashboard.findFirst({
      where: { type: 'ADMIN' },
    });

    if (existingAdmin) {
      throw new ConflictException('Admin already exists');
    }

    // تأكد إن البريد أو التليفون مش مستخدم
    const existingUser = await this.prisma.userDashboard.findFirst({
      where: {email },
    });

    if (existingUser) {
      throw new ConflictException('Email or phone already in use');
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await this.prisma.userDashboard.create({
      data: {
        name,
        email,
        password: hashedPassword,
        type: 'ADMIN',
      },
    });

    const admin_token = this.jwtService.sign({ sub: admin.id, type: admin.type });

    return { message: 'Admin created successfully', admin, admin_token };
  }
async adminLogin(authDto: Login) {
    const { email, phone, password } = authDto;

    if (!email && !phone) throw new BadRequestException('Email or phone is required');

    const admin = await this.prisma.userDashboard.findFirst({
      where: { email, type: 'ADMIN' }, // فقط admins
    });

    if (!admin) throw new UnauthorizedException('Admin not found');

    // تحقق من كلمة المرور (افترض أنها مخزنة بشكل مشفر)
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const admin_token = this.jwtService.sign({ sub: admin.id, type: admin.type });

    return { admin_token, admin };
  }
  // جلب كل الـ Clients
async getAllClients() {
  const clients = await this.prisma.user.findMany({
    where: { type: 'CLIENT' },
    include: { addresses: true, market: true },
  });
  return clients ;
}

// جلب كل الـ Owners
async getAllOwners() {
  const owners = await this.prisma.user.findMany({
    where: { type: 'OWNER' },
    include: { addresses: true, market: true },
  });
  return  owners ;
}
// auth.service.ts
async getMarkets() {
  return this.prisma.market.findMany({
    include: {
      owner: true, // لو عايز تجيب بيانات الـ Owner لكل Market
      products: true, // لو حابب تجيب المنتجات المرتبطة
    },
  });
}

// داخل AuthService
async getDashboardData(userId: string, type: string) {
  if (type === 'OWNER') {
    // آخر محادثة
    const conversations = await this.prisma.conversation.findMany({
      where: { users: { has: userId } },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: { senderId: { not: userId }, isRead: false },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' }, // أحدث conversation أولًا
      take: 1,
    });

    let formattedConversation ;

    if (conversations.length > 0) {
      const lastConversation = conversations[0];
      const otherUserId = lastConversation.users.find((uid) => uid !== userId);
      const otherUser = await this.prisma.user.findUnique({
        where: { id: otherUserId },
        select: { id: true, name: true, image: true },
      });
      const lastMsg = lastConversation.messages[0];
      formattedConversation = {
        id: lastConversation.id,
        user: otherUser,
        lastMessage: lastMsg
          ? {
              id: lastMsg.id,
              type: lastMsg.type,
              senderId: lastMsg.senderId,
              text: lastMsg.text,
              image: lastMsg.imageUrl,
              voice: lastMsg.voice,
              createdAt: lastMsg.createdAt,
            }
          : null,
        unreadMessages: lastConversation._count.messages,
      };
    }

    // آخر 5 منتجات
    const lastProducts = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { category: true, market: true },
    });

    return { lastConversation: formattedConversation, lastProducts };
  } else {
    // Client: آخر رسالة أرسلها هو فقط
    const conversations = await this.prisma.conversation.findMany({
      where: { users: { has: userId } },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          where: { senderId: userId },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 1,
    });

    const lastSentMessages = conversations.map((conv) => {
      const msg = conv.messages[0];
      return {
        conversationId: conv.id,
        lastMessage: msg
          ? {
              id: msg.id,
              type: msg.type,
              text: msg.text,
              image: msg.imageUrl,
              voice: msg.voice,
              createdAt: msg.createdAt,
            }
          : null,
      };
    });

    return { lastSentMessages };
  }
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

    if (!user || !user.email) {
      throw new NotFoundException("You Don't Have Email To Send OTP!")
    }
    // await this.mailService.sendOtpMail(user.email, otpCode)

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
  async updateUser(
    userId: string,
    dto: UpdateUserDto,
    userImage?: string | null,
    marketImage?: string | null,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { market: true, addresses: true },
    });

    if (!user) throw new NotFoundException('User not found');

    // صورة اليوزر
    let finalUserImage = user.image;
    if (userImage) {
      finalUserImage = userImage;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name ?? user.name,
        email: dto.email ?? user.email,
        phone: dto.phone ?? user.phone,
        image: finalUserImage,
      }
    });

    // لو Owner نعدل بيانات الماركت
    if (user.type === 'OWNER' && user.market) {

      let finalMarketImage = user.market.image;

      if (marketImage) {
        finalMarketImage = marketImage;
      }

      await this.prisma.market.update({
        where: { id: user.market.id },
        data: {
          name: dto.market?.name ?? user.market.name,
          zone: dto.market?.zone ?? user.market.zone,
          district: dto.market?.district ?? user.market.district,
          address: dto.market?.address ?? user.market.address,
          operations: dto.market?.operations ?? user.market.operations,
          hours: dto.market?.hours ?? user.market.hours,
          image: finalMarketImage
        }
      });
    }

    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { market: true, addresses: true },
    });
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