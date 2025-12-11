import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateMarketDto } from "./dtos/market.dto";
import { CreateMarketDto } from "./dtos/create-market.dto";
import { getDistance } from "src/helpers/distance";

@Injectable()
export class MarketService {
  constructor(private prisma: PrismaService) {}

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
        },
      });
      if (!market) throw new NotFoundException("No market found for this user");
      return { message: "Market loaded successfully", market };
    } else {
      const markets = await this.prisma.market.findMany({
        include: {
          owner: true,
          categories: { include: { category: true } },
          products: true,
        },
      });
      if (!markets || markets.length === 0) throw new NotFoundException("No markets found");

      
      if (userLocation) {
        markets.forEach(m => {
          if (m.location?.length === 2) {
            m["distanceInKm"] = getDistance(userLocation[0], userLocation[1], m.location[0], m.location[1]);
          } else {
            m["distanceInKm"] = null;
          }
        });
        markets.sort((a, b) => (a["distanceInKm"] || Infinity) - (b["distanceInKm"] || Infinity));
      }

      return { message: "Markets for client loaded successfully", markets };
    }
  }

  async getMarketById(marketId: string) {
    const market = await this.prisma.market.findUnique({
      where: { id: marketId },
      include: { owner: true, products: true },
    });
    if (!market) throw new NotFoundException("Market not found");
    return { message: "Market details loaded successfully", market };
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
