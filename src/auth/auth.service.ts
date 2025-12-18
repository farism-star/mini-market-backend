// auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';
import { AuthDto, VerifyOtpDto, UpdateAddressDto, UpdateUserDto } from './dtos/auth.dto';
import { Login } from './dtos/login.dto';

import { MailService } from 'src/mail/mail.service';
import { AddAdminDto } from './dtos/add-admin.dto';
import { getDistance } from "src/helpers/distance";

type MarketWithDistance = {
  distanceInKm: number | null;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) { }

  async register(dto: AuthDto, imageUrl: string | null) {
    const { email, phone, name, type, zone, district, address, operations, hours, location, marketName, categoryIds } = dto;

    // تحقق إن المستخدم موجود بالفعل
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existingUser) {
      throw new ConflictException('User already exists with this email or phone');
    }

    // إنشاء المستخدم
    const user = await this.prisma.user.create({
      data: {
        name,
        email: email ?? null,
        phone,
        type,
        image: imageUrl,
        phoneVerified: false,
        location: type !== 'OWNER' ? (location ?? []) : [],
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

    // إنشاء ماركت لو المستخدم OWNER
    let market: any = null;
    if (type === 'OWNER') {
      market = await this.prisma.market.create({
        data: {
          nameAr: marketName ?? `${name}'s Market`,
          ownerId: user.id,
          zone: zone ?? '',
          district: district ?? '',
          address: address ?? '',
          operations: operations ?? [],
          hours: hours ?? [],
          location: location ?? [],
        },
      });

      // ربط الماركت بالـ categories لو موجودة
      if (Array.isArray((dto as any).categoryIds) && (dto as any).categoryIds.length > 0) {
        const marketCategories = (dto as any).categoryIds.map((catId: string) => ({
          marketId: market.id,
          categoryId: catId,
        }));
        await this.prisma.marketCategory.createMany({ data: marketCategories });
      }
    }

    // إرسال OTP (مثال)
    await this.sendOtp({ email, phone });

    return { message: 'User registered successfully', user, market };
  }



  async AdminAddUsers(dto: AuthDto, imageUrl: string | null) {
    const { email, phone, name, type, zone, district, address, operations, hours, location, marketName, categoryIds } = dto;

    // تحقق إن المستخدم موجود بالفعل
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existingUser) {
      throw new ConflictException('User already exists with this email or phone');
    }

    // إنشاء المستخدم
    const user = await this.prisma.user.create({
      data: {
        name,
        email: email ?? null,
        phone,
        type,
        image: imageUrl,
        phoneVerified: false,
        location: type !== 'OWNER' ? (location ?? []) : [],
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

    // إنشاء ماركت لو المستخدم OWNER
    let market: any = null;
    if (type === 'OWNER') {
      market = await this.prisma.market.create({
        data: {
          nameAr: marketName ?? `${name}'s Market`,
          ownerId: user.id,
          zone: zone ?? '',
          district: district ?? '',
          address: address ?? '',
          operations: operations ?? [],
          hours: hours ?? [],
          location: location ?? [],
        },
      });

      // ربط الماركت بالـ categories لو موجودة
      if (Array.isArray((dto as any).categoryIds) && (dto as any).categoryIds.length > 0) {
        const marketCategories = (dto as any).categoryIds.map((catId: string) => ({
          marketId: market.id,
          categoryId: catId,
        }));
        await this.prisma.marketCategory.createMany({ data: marketCategories });
      }
    }



    return { message: 'User Added successfully', user, market };
  }

  async checkOwnerApproved(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isAproved: true, isFeesRequired: true, name: true, id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: "Owner approval status loaded",
      isApproved: user.isAproved,
      isFeesRequired: user.isFeesRequired
    };
  }
  async checkOwnerFees(userId: string) {
    // جلب معلومات المالك
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, id: true },
    });

    if (!user) throw new NotFoundException('User not found');

    // جلب الماركت الخاص بالمالك
    const market = await this.prisma.market.findUnique({
      where: { ownerId: userId },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        limitFees: true,
        currentFees: true,
        feePerOrder: true,
      },
    });

    if (!market) throw new NotFoundException('Market not found');

    const limitFees = market.limitFees || 0;
    const currentFees = market.currentFees || 0;
    const feePerOrder = market.feePerOrder || 0;
    const totalDue = limitFees - currentFees;

    let messageEn = '';
    let messageAr = '';

    if (totalDue > 0) {
      messageEn = `⚠️ Attention! You have pending fees that must be paid before opening your market.
Limit Fees: ${limitFees.toFixed(2)}
Current Fees Paid: ${currentFees.toFixed(2)}
Fee Per Order: ${feePerOrder.toFixed(2)}
Amount Due: ${totalDue.toFixed(2)}`;

      messageAr = `⚠️ تنبيه! لديك مستحقات لم يتم دفعها بعد، يجب دفعها قبل فتح السوق.
الحد الأقصى للرسوم: ${limitFees.toFixed(2)}
المستحق المدفوع: ${currentFees.toFixed(2)}
الرسوم لكل طلب: ${feePerOrder.toFixed(2)}
المبلغ المستحق: ${totalDue.toFixed(2)}`;
    } else {
      messageEn = `✅ Your market is in good standing. No pending fees.`;
      messageAr = `👍 سوقك جاهز للعمل، لا توجد مستحقات متبقية.`;
    }

    return {
      market,
      fees: {
        limitFees,
        currentFees,
        feePerOrder,
        totalDue,
      },
      messageEn,
      messageAr,

    };
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
      where: { email },
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
    return clients;
  }

  // جلب كل الـ Owners
  async getAllOwners() {
    const owners = await this.prisma.user.findMany({
      where: { type: 'OWNER' },
      include: { addresses: true, market: true, payments: true },
    });
    return owners;
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


  async getDashboardData(
    userId: string,
    type: string,
    categoryId?: string,
    search?: string,
  ) {
    if (type === 'OWNER') {
      const conversations = await this.prisma.conversation.findMany({
        where: { users: { has: userId } },
        include: {
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          _count: {
            select: {
              messages: { where: { senderId: { not: userId }, isRead: false } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 1,
      });

      let formattedConversation: any = null;

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

      const lastProducts = await this.prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { market: true },
      });

      return { lastConversation: formattedConversation, lastProducts };
    }

    const categories = await this.prisma.category.findMany();

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { location: true },
    });

    const userLocation = user?.location;

    let markets = await this.prisma.market.findMany({
      where: {
        ...(categoryId && {
          categories: {
            some: {
              categoryId,
            },
          },
        }),
        ...(search && {
          OR: [
            {
              nameAr: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              nameEn: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }),
      },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        descriptionAr: true,
        descriptionEn: true,
        ownerId: true,
        zone: true,
        district: true,
        address: true,
        operations: true,
        hours: true,
        image: true,
        commissionFee: true,
        location: true,
        rate: true,
        isOpen: true,
        from: true,
        to: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (userLocation) {
      const marketsWithDistance = markets.map((m: any) => {
        let distanceInKm: number | null = null;

        if (m.location?.length === 2) {
          distanceInKm = getDistance(
            userLocation[0],
            userLocation[1],
            m.location[0],
            m.location[1],
          );
        }

        return { ...m, distanceInKm };
      });

      const sortedMarkets = marketsWithDistance.sort(
        (a, b) => (a.distanceInKm ?? Infinity) - (b.distanceInKm ?? Infinity),
      );

      const filteredMarkets = sortedMarkets.filter(
        (m) => m.distanceInKm !== null && m.distanceInKm <= 30,
      );

      return { categories, markets: filteredMarkets };
    }

    return { categories, markets };
  }





 async login(authDto: Login) {
  const { phone } = authDto;

  if (!phone) {
    throw new BadRequestException('Phone or email is required');
  }

  const user = await this.prisma.user.findFirst({
    where: {
      OR: [
        { email: phone },
        { phone: phone },
      ],
    },
    include: { market: true, addresses: true },
  });

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  await this.sendOtp({
    email: user.email!,
    phone: user.phone!,
  });

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
    //   await this.mailService.sendOtpMail(user.email, otpCode)

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

    // تحقق من الرقم قبل التحديث
    if (dto.phone && dto.phone !== user.phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone: dto.phone },
      });
      if (existingPhone) {
        throw new BadRequestException('Phone number is already in use by another user.');
      }
    }

    // تحقق من الايميل قبل التحديث لو عندك unique
    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new BadRequestException('Email is already in use by another user.');
      }
    }

    // صورة اليوزر
    let finalUserImage = user.image;
    if (userImage) finalUserImage = userImage;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name ?? user.name,
        email: dto.email ?? user.email,
        isAproved: dto.isAproved ?? false,
        phone: dto.phone ?? user.phone,
        image: finalUserImage,
      }
    });

    // لو Owner نعدل بيانات الماركت
    if (user.type === 'OWNER' && user.market) {
      let finalMarketImage = user.market.image;
      if (marketImage) finalMarketImage = marketImage;

      await this.prisma.market.update({
        where: { id: user.market.id },
        data: {
          nameAr: dto.market?.name ?? user.market.nameAr,
          zone: dto.market?.zone ?? user.market.zone,
          district: dto.market?.district ?? user.market.district,
          address: dto.market?.address ?? user.market.address,
          operations: dto.market?.operations ?? user.market.operations,
          hours: dto.market?.hours ?? user.market.hours,
          image: finalMarketImage,
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
    await this.prisma.order.deleteMany({});
    await this.prisma.notification.deleteMany({});
    await this.prisma.message.deleteMany({});
    await this.prisma.otp.deleteMany({});
    await this.prisma.product.deleteMany({});
    await this.prisma.marketCategory.deleteMany({});
    await this.prisma.market.deleteMany({});
    await this.prisma.address.deleteMany({});
    await this.prisma.user.deleteMany({});

    return { message: 'All user data has been deleted successfully.' };
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { market: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return await this.prisma.$transaction(async (prisma) => {
      // حذف الرسائل والإشعارات والـ OTP الخاصة بالمستخدم
      await prisma.message.deleteMany({ where: { senderId: userId } });
      await prisma.notification.deleteMany({ where: { userId } });
      await prisma.otp.deleteMany({ where: { userId } });

      // حذف العناوين
      await prisma.address.deleteMany({ where: { userId } });

      // لو Owner → حذف الماركت والمنتجات والطلبات
      if (user.type === 'OWNER' && user.market) {
        const marketId = user.market.id;

        await prisma.order.deleteMany({ where: { marketId } });
        await prisma.product.deleteMany({ where: { marketId } });
        await prisma.market.delete({ where: { id: marketId } });
      }

      // حذف المستخدم نفسه
      await prisma.user.delete({ where: { id: userId } });

      return { message: `User ${user.name} has been deleted successfully.` };
    });
  }

}
