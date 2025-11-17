import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateMarketDto } from "./dtos/market.dto";

@Injectable()
export class MarketService {
  constructor(private prisma: PrismaService) {}

  // OWNER: Get only his market
  async getMyMarket(userId: string, userType: string) {
    if (userType === "OWNER") {
       const market = await this.prisma.market.findUnique({
      where: { ownerId: userId },
    });

    if (!market) {
      throw new NotFoundException("No market found for this user");
    }

    return { message: "Market loaded successfully", market };
    }else{
         const markets = await this.prisma.market.findMany({include:{owner:true}
    });

    if (!markets) {
      throw new NotFoundException("No markets found for You");
    }

    return { message: "Markets For Client loaded successfully", markets };
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
