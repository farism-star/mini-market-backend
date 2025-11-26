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
  ) { }

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

const Market = await this.prisma.market.findFirst({
  where: { ownerId: user.id },
});

if (!Market) {
  throw new BadRequestException("Owner has no market yet");
}

return this.prisma.product.create({
  data: {
    titleAr: dto.titleAr!,
    titleEn: dto.titleEn!,
    price: dto.price!,
    images,
    categoryId: dto.categoryId!,
    marketId: Market.id,  // ← مش undefined
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
    const existeUser = await this.prisma.user.findFirst({ where: { id: user.id } })
    if (!existeUser) {
      throw new UnauthorizedException('User not found');
    }
console.log(existeUser);

    // لو Owner يرجع بس منتجاته
    if (user.type === 'OWNER') {
      const Market = await this.prisma.market.findFirst({ where: { ownerId: existeUser.id } })
      console.log(Market);
      
      return this.prisma.product.findMany({
        where: { marketId: Market?.id },
        include: {
          category: true,
          market: true,
        },
        orderBy: { titleAr: 'asc' },
      });
    }

    // لو Client يرجع كل المنتجات
    return this.prisma.product.findMany({
      include: {
        category: true,
        market: true,
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
        market: true,
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
