import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateMarketDto } from "./dtos/market.dto";
import { CreateMarketDto } from "./dtos/create-market.dto";
import { getDistance } from "src/helpers/distance";

@Injectable()
export class MarketService {
  constructor(private prisma: PrismaService) {}
  private calculateAverageRate(orders: { rate: number | 0 }[]): number {
    // تصفية الطلبات اللي فيها تقييم فقط
    const validRates = orders
      .map(order => order.rate)
      .filter((rate): rate is number => rate !== null && rate !== undefined);
    
    // إذا مفيش تقييمات، نرجع null
    if (validRates.length === 0) {
      return 0;
    }
    
    // حساب المتوسط
    const sum = validRates.reduce((acc, rate) => acc + rate, 0);
    const average = sum / validRates.length;
    
    // تقريب لرقمين عشريين
    return Math.round(average * 100) / 100;
  }

  private isMarketOpen(operations: string[], hours: string[]): boolean {
    // إذا مفيش operations أو hours، المحل مغلق
    if (!operations || operations.length === 0 || !hours || hours.length === 0) {
      return false;
    }
  
    // الحصول على الوقت الحالي
    const now = new Date();
    
    // الحصول على اليوم الحالي بالإنجليزية (مثل: Sun, Mon, Tue)
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' });
    
    // التحقق من أن اليوم الحالي موجود في operations
    const isDayOpen = operations.includes(currentDay);
    
    if (!isDayOpen) {
      return false; // اليوم مش في أيام العمل
    }
  
    // التحقق من الساعات
    const currentTime = now.getHours() * 60 + now.getMinutes(); // الوقت الحالي بالدقائق
    
    // نفترض أن hours هو array من strings مثل: ["7:00 AM - 4:00 PM"]
    for (const hourRange of hours) {
      const isWithinHours = this.isTimeWithinRange(currentTime, hourRange);
      if (isWithinHours) {
        return true; // الوقت ضمن أوقات العمل
      }
    }
    
    return false; // الوقت خارج أوقات العمل
  }
  
  // ✅ دالة مساعدة للتحقق من الوقت
  private isTimeWithinRange(currentTimeInMinutes: number, hourRange: string): boolean {
    try {
      // تقسيم الـ range مثل: "7:00 AM - 4:00 PM"
      const [startStr, endStr] = hourRange.split('-').map(s => s.trim());
      
      // تحويل الوقت من 12-hour إلى دقائق
      const startMinutes = this.convertTo24HourMinutes(startStr);
      const endMinutes = this.convertTo24HourMinutes(endStr);
      
      // التحقق من أن الوقت الحالي بين البداية والنهاية
      return currentTimeInMinutes >= startMinutes && currentTimeInMinutes <= endMinutes;
    } catch (error) {
      console.error('Error parsing time range:', hourRange, error);
      return false;
    }
  }
  
  // ✅ دالة لتحويل الوقت من 12-hour format إلى دقائق
  private convertTo24HourMinutes(timeStr: string): number {
    // مثال: "7:00 AM" أو "4:00 PM"
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour24 = hours;
    
    // تحويل من 12-hour إلى 24-hour
    if (period === 'PM' && hours !== 12) {
      hour24 = hours + 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    return hour24 * 60 + minutes;
  }

  async createMarket(dto: CreateMarketDto) {
    // تحقق إن Owner موجود
    const owner = await this.prisma.user.findUnique({ where: { id: dto.ownerId } });
    if (!owner) throw new NotFoundException("Owner not found");

    // إنشاء الماركت
    const market = await this.prisma.market.create({
      data: {
        nameAr: dto.nameAr ?? "",
        nameEn: dto.nameEn ?? "",
        descriptionAr: dto.descriptionAr ?? "",
        descriptionEn: dto.descriptionEn ?? "",
        ownerId: dto.ownerId,
        zone: dto.zone ?? "",
        district: dto.district ?? "",
        address: dto.address ?? "",
        operations: dto.operations ?? [],
        hours: dto.hours ?? [],
        commissionFee: dto.commissionFee ?? 5,
        location: dto.location ?? [],
      },
    });

    // ربط Market بالـ Categories
    if (Array.isArray(dto.categoryIds) && dto.categoryIds.length > 0) {
      const marketCategories = dto.categoryIds.map((catId) => ({
        marketId: market.id,
        categoryId: catId,
      }));
      await this.prisma.marketCategory.createMany({ data: marketCategories });
    }

    return { message: "Market created", market };
  }

  async getMyMarket(userId: string, userType: string, userLocation?: [number, number]) {
    if (userType === "OWNER") {
      const market = await this.prisma.market.findUnique({
        where: { ownerId: userId },
        include: {
          categories: { include: { category: true } },
          products: true,
          orders: { 
            where: { 
              rate: { not: 0 }
            },
            select: { rate: true }
          }
        },
      });
      
      if (!market) throw new NotFoundException("No market found for this user");
      
      // حساب متوسط التقييم
      const averageRate = this.calculateAverageRate(market.orders);
      
      // حساب isOpen ديناميكياً
      const isOpen = this.isMarketOpen(market.operations, market.hours);
      
      // إزالة orders من الـ response وإضافة rate و isOpen
      const { orders, ...marketData } = market;
      
      return { 
        message: "Market loaded successfully", 
        market: {
          ...marketData,
          rate: averageRate,
          isOpen // ⬅️ الحالة الديناميكية
        }
      };
    } else {
      const markets = await this.prisma.market.findMany({
        include: {
          owner: true,
          categories: { include: { category: true } },
          products: true,
          orders: { 
            where: { 
              rate: { not: 0 }
            },
            select: { rate: true }
          }
        },
      });
      
      if (!markets || markets.length === 0) throw new NotFoundException("No markets found");
  
      // إضافة rate و isOpen لكل market
      const marketsWithRate = markets.map(market => {
        const averageRate = this.calculateAverageRate(market.orders);
        const isOpen = this.isMarketOpen(market.operations, market.hours); // ⬅️ حساب isOpen
        const { orders, ...marketData } = market;
        
        return {
          ...marketData,
          rate: averageRate,
          isOpen // ⬅️ الحالة الديناميكية
        };
      });
  
      // حساب المسافة إذا كان الموقع متاح
      if (userLocation) {
        marketsWithRate.forEach(m => {
          if (m.location?.length === 2) {
            m["distanceInKm"] = getDistance(
              userLocation[0], 
              userLocation[1], 
              m.location[0], 
              m.location[1]
            );
          } else {
            m["distanceInKm"] = null;
          }
        });
        marketsWithRate.sort((a, b) => 
          (a["distanceInKm"] || Infinity) - (b["distanceInKm"] || Infinity)
        );
      }
  
      return { 
        message: "Markets for client loaded successfully", 
        markets: marketsWithRate 
      };
    }
  }
  

  async getMarketById(marketId: string) {
    const market = await this.prisma.market.findUnique({
      where: { id: marketId },
      include: { 
        owner: true, 
        products: true,
        orders: {
          where: { rate: { not: 0 } },
          select: { rate: true }
        }
      },
    });
    
    if (!market) throw new NotFoundException("Market not found");
    
    // ✅ حساب rate و isOpen ديناميكياً
    const averageRate = this.calculateAverageRate(market.orders);
    const isOpen = this.isMarketOpen(market.operations, market.hours);
    
    // ✅ إزالة orders من الـ response
    const { orders, ...marketData } = market;
    
    return { 
      message: "Market details loaded successfully", 
      market: {
        ...marketData,
        rate: averageRate,
        isOpen
      }
    };
  }

  async updateMyMarket(userId: string, userType: string, dto: UpdateMarketDto) {
    if (userType !== "OWNER") throw new ForbiddenException("Only owners can update markets");

    const market = await this.prisma.market.findUnique({ where: { ownerId: userId } });
    if (!market) throw new NotFoundException("Market not found");

    try {
      // تحديث الحقول العادية
      const dataToUpdate: any = { ...dto };
      if (dto.from) dataToUpdate.from = new Date(dto.from);
      if (dto.to) dataToUpdate.to = new Date(dto.to);

      const updated = await this.prisma.market.update({
        where: { id: market.id },
        data: dataToUpdate,
      });

      // تحديث الـ categories لو موجودة
      if (dto.categoryIds && Array.isArray(dto.categoryIds)) {
        // احذف القديم
        await this.prisma.marketCategory.deleteMany({ where: { marketId: market.id } });
        // أضف الجديد
        const marketCategories = dto.categoryIds.map((catId) => ({
          marketId: market.id,
          categoryId: catId,
        }));
        await this.prisma.marketCategory.createMany({ data: marketCategories });
      }

      return { message: "Market updated successfully", market: updated };
    } catch (err) {
      throw new BadRequestException(err?.message || "Failed to update market");
    }
  }


 async updateMarketByAdmin(marketId: string, dto: UpdateMarketDto) {
    const market = await this.prisma.market.findUnique({ where: { id: marketId } });
    if (!market) throw new NotFoundException("Market not found");

    try {
      // تحديث الحقول العادية
      const dataToUpdate: any = { ...dto };
      if (dto.from) dataToUpdate.from = new Date(dto.from);
      if (dto.to) dataToUpdate.to = new Date(dto.to);

      const updated = await this.prisma.market.update({
        where: { id: marketId },
        data: dataToUpdate,
      });

      // تحديث الـ categories لو موجودة
      if (dto.categoryIds && Array.isArray(dto.categoryIds)) {
        await this.prisma.marketCategory.deleteMany({ where: { marketId: marketId } });
        const marketCategories = dto.categoryIds.map((catId) => ({
          marketId: marketId,
          categoryId: catId,
        }));
        await this.prisma.marketCategory.createMany({ data: marketCategories });
      }

      return { message: "Market updated successfully by Admin", market: updated };
    } catch (err) {
      throw new BadRequestException(err?.message || "Failed to update market");
    }
  }

  
  async deleteMarketByAdmin(marketId: string) {
    const market = await this.prisma.market.findUnique({ where: { id: marketId } });
    if (!market) throw new NotFoundException("Market not found");

    // يجب حذف السجلات المرتبطة (MarketCategory) أولاً
    await this.prisma.marketCategory.deleteMany({ where: { marketId: marketId } });
    // قد تحتاج أيضًا لحذف المنتجات (products) أو وضعها في حالة "محذوف" حسب منطق عملك

    const deletedMarket = await this.prisma.market.delete({
      where: { id: marketId },
    });

    return { message: "Market deleted successfully by Admin", market: deletedMarket };
  }


}
