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
      // 1) Check Role
      const user = await this.prisma.user.findUnique({
        where: { id: ownerId },
      });

      if (!user || user.type !== 'OWNER') {
        throw new UnauthorizedException('Only OWNER can create products');
      }

      // 2) Get Market
      const Market = await this.prisma.market.findFirst({
        where: { ownerId: user.id },
      });

      if (!Market) {
        throw new BadRequestException('Owner has no market yet');
      }

      // 3) Create Product with uploaded images
      return this.prisma.product.create({
        data: {
          titleAr: dto.titleAr!,
          titleEn: dto.titleEn!,
          descreptionAr: dto.descreptionAr,
          descriptionEn: dto.descriptionEn!,
          price: dto.price!,
          images: imageUrls, // ✅ استخدام الصور المرفوعة من Multer
          categoryId: dto.categoryId!,
          marketId: Market.id,
        },
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        err.message || 'Failed to create product',
      );
    }
  }

async findAll(user: any, query: any) {
  const { page = 1, limit = 10, search = '', categoryId, categoryName } = query;

  const skip = (page - 1) * limit;
  const take = Number(limit);

  // تأكيد وجود المستخدم
  const existeUser = await this.prisma.user.findFirst({
    where: { id: user.id },
  });

  if (!existeUser) {
    throw new UnauthorizedException('User not found');
  }

  // فلتر الاساس
  const filters: any = {};

  // لو Owner يعرض منتجاته فقط
  if (user.type === 'OWNER') {
    const market = await this.prisma.market.findFirst({
      where: { ownerId: existeUser.id },
    });

    filters.marketId = market?.id;
  }

  // فلترة حسب Category ID
  if (categoryId) {
    filters.categoryId = categoryId;
  }

  // فلترة حسب Category Name
  if (categoryName) {
    filters.category = {
      nameAr: { contains: categoryName, mode: 'insensitive' },
    };
  }

  // البحث (search)
  if (search) {
    filters.OR = [
      { titleAr: { contains: search, mode: 'insensitive' } },
      { titleEn: { contains: search, mode: 'insensitive' } },
    ];
  }

  // عدد النتائج الكلي
  const total = await this.prisma.product.count({
    where: filters,
  });

  // البيانات مع pagination
  const data = await this.prisma.product.findMany({
    where: filters,
    include: {
      category: true,
      market: true,
    },
    orderBy: { titleAr: 'asc' },
    skip,
    take,
  });

  return {
   pagination:{
     page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
   },
    data,
  };
}


  async findByOwner(ownerId: string) {
    return await this.prisma.product.findMany({
      where: { marketId: ownerId },
      include: {
        category: true,
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        market: true,
      },
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

      // ✅ إضافة الصور الجديدة للصور القديمة
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
          categoryId: dto.categoryId ?? product.categoryId,
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