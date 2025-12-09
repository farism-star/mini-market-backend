import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateMarketDto } from "./dtos/market.dto";
import { getDistance } from "src/helpers/distance";

@Injectable()
export class MarketService {
  constructor(private prisma: PrismaService) {}

  // OWNER: Get only his market
async getMyMarket(userId: string, userType: string, userLocation?: [number, number]) {
  if (userType === "OWNER") {
    const market = await this.prisma.market.findUnique({
      where: { ownerId: userId },
    });

    if (!market) {
      throw new NotFoundException("No market found for this user");
    }

    return { message: "Market loaded successfully", market };
  } else {
    const markets = await this.prisma.market.findMany({
      include: { owner: true },
    });

    if (!markets || markets.length === 0) {
      throw new NotFoundException("No markets found for you");
    }

    // لو المستخدم أرسل location، نرتب الماركت حسب الأقرب
    if (userLocation) {
      markets.sort((a, b) => {
        const distA = a.location ? getDistance(userLocation[0], userLocation[1], a.location[0], a.location[1]) : Infinity;
        const distB = b.location ? getDistance(userLocation[0], userLocation[1], b.location[0], b.location[1]) : Infinity;
        return distA - distB;
      });
    }

    return { message: "Markets for client loaded successfully", markets };
  }
}

  // OWNER: Update only his market
  async updateMyMarket(
    userId: string,
    userType: string,
    dto: UpdateMarketDto,
  ) {
    if (userType !== "OWNER") {
      throw new ForbiddenException("Only owners can update markets");
    }

    const market = await this.prisma.market.findUnique({
      where: { ownerId: userId },
    });

    if (!market) {
      throw new NotFoundException("Market not found");
    }

    try {
      const updated = await this.prisma.market.update({
        where: { id: market.id },
        data: { ...dto },
      });

      return {
        message: "Market updated successfully",
        market: updated,
      };
    } catch (err) {
      throw new ForbiddenException("Failed to update market");
    }
  }
}
