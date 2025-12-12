import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateDeliveryDto } from "./dtos/create-delivery.dto";
import { UpdateDeliveryDto } from "./dtos/update-delivery.dto";
import { Role } from "src/auth/roles.enum";

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

 async createDelivery(
  dto: CreateDeliveryDto,
  userId: string,
  userType: string,
  imageUrl?: string,
) {
    if (userType !== Role.OWNER) {
      throw new ForbiddenException("Only owners can add deliveries");
    }

    const market = await this.prisma.market.findFirst({
      where: { ownerId: userId },
    });

    if (!market) throw new NotFoundException("Market not found");

    return this.prisma.delivery.create({
      data: {
        ...dto,
        image: imageUrl,
        marketId: market.id,
      },
    });
  }

  async getMyDeliveries(userId: string, userType: string) {
    if (userType !== Role.OWNER) {
      throw new ForbiddenException("Only owners can view deliveries");
    }

    const market = await this.prisma.market.findFirst({
      where: { ownerId: userId },
    });

    if (!market) throw new NotFoundException("Market not found");

    return this.prisma.delivery.findMany({
      where: { marketId: market.id },
    });
  }

async updateDelivery(
  id: string,
  dto: UpdateDeliveryDto,
  user: any,
  imageUrl?: string,
) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id },
    });

    if (!delivery) throw new NotFoundException("Delivery not found");

    if (user.type === Role.OWNER) {
      const market = await this.prisma.market.findFirst({
        where: { ownerId: user.id },
      });

      if (!market || market.id !== delivery.marketId) {
        throw new ForbiddenException("You can only update your market deliveries");
      }
    }

    return this.prisma.delivery.update({
      where: { id },
      data: {
        ...dto,
        ...(imageUrl && { image: imageUrl }),
      },
    });
  }

  async deleteDelivery(id: string, user: any) {
    const delivery = await this.prisma.delivery.findFirst({ where: { id } });

    if (!delivery) throw new NotFoundException("Delivery not found");

    if (user.type === Role.OWNER) {
      const market = await this.prisma.market.findFirst({
        where: { ownerId: user.id },
      });

      if (!market || market.id !== delivery.marketId) {
        throw new ForbiddenException("You can only delete your market deliveries");
      }
    }

    return this.prisma.delivery.delete({
      where: { id },
    });
  }

  async getAll() {
    return this.prisma.delivery.findMany();
  }
}
