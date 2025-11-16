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
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(ownerId: string, dto: CreateProductDto) {
    try {
      // 1) Check Role
      const user = await this.prisma.user.findUnique({
        where: { id: ownerId },
      });

      if (!user || user.type !== 'OWNER') {
        throw new UnauthorizedException('Only OWNER can create products');
      }

      // 2) Upload images (if exists)
      let images: string[] = [];

      if (dto.images && Array.isArray(dto.images)) {
        images = await Promise.all(
          dto.images.map((img) =>
            this.cloudinary.uploadImageFromBase64(img, 'products'),
          ),
        );
      }

      // 3) Create product
      return await this.prisma.product.create({
        data: {
          titleAr: dto.titleAr,
          titleEn: dto.titleEn,
          price: dto.price,
          images,
          categoryId: dto.categoryId,
          marketId: ownerId,
        },
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        err.message || 'Failed to create product',
      );
    }
  }


async findAll(user: any) {
  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  // لو Owner يرجع بس منتجاته
  if (user.type === 'OWNER') {
    return this.prisma.product.findMany({
      where: { marketId: user.id },
      include: {
        category: true,
        Market: true,
      },
      orderBy: { titleAr: 'asc' },
    });
  }

  // لو Client يرجع كل المنتجات
  return this.prisma.product.findMany({
    include: {
      category: true,
      Market: true,
    },
    orderBy: { titleAr: 'asc' },
  });
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
        Market: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

 
  async update(id: string, dto: UpdateProductDto, user: any) {
    try {
      if (user.type !== 'OWNER') {
        throw new UnauthorizedException('Only OWNER can update products');
      }

      const product = await this.prisma.product.findUnique({ where: { id } });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Upload new images if exists
      let images = product.images;

      if (dto.images && Array.isArray(dto.images)) {
        const newImages = await Promise.all(
          dto.images.map((img) =>
            this.cloudinary.uploadImageFromBase64(img, 'products'),
          ),
        );

        images = [...images, ...newImages];
      }

      return await this.prisma.product.update({
        where: { id },
        data: {
          titleAr: dto.titleAr ?? product.titleAr,
          titleEn: dto.titleEn ?? product.titleEn,
          price: dto.price ?? product.price,
          images,
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
