import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  // ============================
  // 🔥 Create Category
  // ============================
  async create(dto: CreateCategoryDto, user: any, iconUrl: string | null) {
    try {
      if (user.type !== 'OWNER') {
        throw new UnauthorizedException('Only OWNER can create categories');
      }

      // ✅ احصل على الـ market الخاص بالـ owner
      const market = await this.prisma.market.findUnique({
        where: { ownerId: user.sub || user.id },
      });

      if (!market) {
        throw new NotFoundException('Market not found for this owner');
      }

      return await this.prisma.category.create({
        data: {
          nameAr: dto.nameAr,
          nameEn: dto.nameEn,
          icon: iconUrl,
          marketId: market.id, // ✅ استخدم market.id
        },
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        err.message || 'Failed to create category',
      );
    }
  }

  // ============================
  // 🔥 Find All
  // ============================
 async findAll(user: any) {

  if (user.role === 'OWNER') {
    // Owner -> رجّع بس ال categories بتاعت الماركت بتاعه
    return this.prisma.category.findMany({
      where: {
        marketId: user.marketId,
      },
      orderBy: { nameAr: 'asc' },
      include: {
        market: true
      },
    });
  }

  // Client -> رجّع كل المنتجات
  return this.prisma.category.findMany({
    orderBy: { nameAr: 'asc' },
    include: {
      market: true
    },
  });
}


  // ============================
  // 🔥 Find One
  // ============================
  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        market: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  // ============================
  // 🔥 Update Category
  // ============================
  async update(
    id: string,
    dto: UpdateCategoryDto,
    user: any,
    iconUrl: string | null,
  ) {
    try {
      if (user.type !== 'OWNER') {
        throw new UnauthorizedException('Only OWNER can update categories');
      }

      const category = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      // ✅ مسح الصورة القديمة لو في صورة جديدة
      if (iconUrl && category.icon) {
        try {
          const oldIconPath = join(process.cwd(), category.icon);
          if (existsSync(oldIconPath)) {
            await unlink(oldIconPath);
            console.log('Old icon deleted:', category.icon);
          }
        } catch (error) {
          console.log('Failed to delete old icon:', error);
        }
      }

      return await this.prisma.category.update({
        where: { id },
        data: {
          nameAr: dto.nameAr ?? category.nameAr,
          nameEn: dto.nameEn ?? category.nameEn,
          icon: iconUrl ?? category.icon, // ✅ استخدم الصورة الجديدة أو القديمة
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        err.message || 'Failed to update category',
      );
    }
  }

  // ============================
  // 🔥 Delete Category
  // ============================
  async remove(id: string, user: any) {
    try {
      if (user.type !== 'OWNER') {
        throw new UnauthorizedException('Only OWNER can delete categories');
      }

      const category = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      return await this.prisma.$transaction(async (tx) => {
        // ✅ مسح الصورة من الديسك
        if (category.icon) {
          try {
            const iconPath = join(process.cwd(), category.icon);
            if (existsSync(iconPath)) {
              await unlink(iconPath);
              console.log('Category icon deleted:', category.icon);
            }
          } catch (error) {
            console.log('Failed to delete category icon:', error);
          }
        }

        // ✅ مسح الـ category
        await tx.category.delete({
          where: { id },
        });

        return { message: 'Category deleted successfully' };
      });
    } catch (err) {
      throw new InternalServerErrorException(
        err.message || 'Failed to delete category',
      );
    }
  }
}