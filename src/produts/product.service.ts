import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateProductDto, imageUrls: string[]) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: ownerId },
      });

      if (!user || user.type !== 'OWNER') {
        throw new UnauthorizedException('Only OWNER can create products');
      }

      const market = await this.prisma.market.findFirst({
        where: { ownerId: user.id },
      });

      if (!market) {
        throw new BadRequestException('Owner has no market yet');
      }

      return this.prisma.product.create({
        data: {
          titleAr: dto.titleAr!,
          titleEn: dto.titleEn!,
          descriptionAr: dto.descriptionAr ?? "",
          descriptionEn: dto.descriptionEn ?? "",
          price: dto.price!,
          images: imageUrls,
          marketId: market.id,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        err.message || 'Failed to create product',
      );
    }
  }

  async findAll(user: any, query: any) {
    const { page = 1, limit = 10, search = '' } = query;

    const skip = (page - 1) * limit;
    const take = Number(limit);

    const existeUser = await this.prisma.user.findFirst({
      where: { id: user.id },
    });

    if (!existeUser) {
      throw new UnauthorizedException('User not found');
    }

    const filters: any = {};

    if (user.type === 'OWNER') {
      const market = await this.prisma.market.findFirst({
        where: { ownerId: existeUser.id },
      });

      filters.marketId = market?.id;
    }

    if (search) {
      filters.OR = [
        { titleAr: { contains: search, mode: 'insensitive' } },
        { titleEn: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.product.count({ where: filters });

    const data = await this.prisma.product.findMany({
      where: filters,
      include: { market: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const formattedData = data.map(p => ({
      ...p,
      price: parseFloat(Number(p.price).toFixed(2)),
    }));

    return {
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: formattedData,
    };
  }

  async findByOwner(ownerId: string) {
    return await this.prisma.product.findMany({
      where: { marketId: ownerId },
      include: { market: true },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { market: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto, user: any, imageUrls: string[]) {
    try {
      if (user.type !== 'OWNER') {
        throw new UnauthorizedException('Only OWNER can update products');
      }

      const product = await this.prisma.product.findUnique({ where: { id } });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const updatedImages = imageUrls.length > 0 
        ? [...product.images, ...imageUrls] 
        : product.images;

      return await this.prisma.product.update({
        where: { id },
        data: {
          titleAr: dto.titleAr ?? product.titleAr,
          titleEn: dto.titleEn ?? product.titleEn,
          price: dto.price ?? product.price,
          images: updatedImages,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        err.message || 'Failed to update product',
      );
    }
  }

  async remove(id: string, user: any) {
    try {
      if (user.type !== 'OWNER') {
        throw new UnauthorizedException('Only OWNER can delete products');
      }

      const product = await this.prisma.product.findUnique({ where: { id } });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      return await this.prisma.$transaction(async (tx) => {
        await tx.product.delete({
          where: { id },
        });

        return { message: 'Product deleted successfully' };
      });
    } catch (err) {
      throw new InternalServerErrorException(
        err.message || 'Failed to delete product',
      );
    }
  }
}
