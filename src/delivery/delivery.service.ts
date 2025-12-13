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
  let marketId: string;

  if (userType === Role.OWNER) {
    // Owner → نجيب الماركت الخاص بيه
    const market = await this.prisma.market.findFirst({
      where: { ownerId: userId },
    });

    if (!market) throw new NotFoundException("Market not found");

    marketId = market.id;

  } else if (userType === Role.ADMIN) {
    // Admin → لازم يكون الـ DTO فيه marketId
    if (!dto.marketId) {
      throw new ForbiddenException("Admin must provide marketId");
    }
    marketId = dto.marketId;
  } else {
    throw new ForbiddenException("Only owners or admins can add deliveries");
  }

  return this.prisma.delivery.create({
    data: {
      ...dto,
      image: imageUrl,
      marketId, // تم ضبطها بناءً على النوع
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

  let marketIdToUpdate = delivery.marketId;

  if (user.type === Role.OWNER) {
    // Owner → التأكد من ملكية الماركت
    const market = await this.prisma.market.findFirst({
      where: { ownerId: user.id },
    });

    if (!market || market.id !== delivery.marketId) {
      throw new ForbiddenException("You can only update your market deliveries");
    }

    // Owner لا يقدر يغيّر marketId
    marketIdToUpdate = delivery.marketId;

  } else if (user.type === Role.ADMIN) {
    // Admin → يمكنه تحديد marketId من DTO
    if (dto.marketId) {
      // التأكد أن الماركت موجودة
      const market = await this.prisma.market.findUnique({
        where: { id: dto.marketId },
      });
      if (!market) throw new NotFoundException("Market not found");
      marketIdToUpdate = dto.marketId;
    }
  } else {
    throw new ForbiddenException("Only owners or admins can update deliveries");
  }

  return this.prisma.delivery.update({
    where: { id },
    data: {
      ...dto,
      ...(imageUrl && { image: imageUrl }),
      marketId: marketIdToUpdate,
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
