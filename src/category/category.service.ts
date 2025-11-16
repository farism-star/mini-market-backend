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
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}


  async create(dto: CreateCategoryDto, user: any) {
    try {
      if (user.type !== 'OWNER') {
        throw new UnauthorizedException('Only OWNER can create categories');
      }

      let imageUrl = '';

      if (dto.icon) {
        imageUrl = await this.cloudinary.uploadImageFromBase64(
          dto.icon,
          'categories',
        );
      }

      return await this.prisma.category.create({
        data: {
          nameAr: dto.nameAr,
          nameEn: dto.nameEn,
          icon: imageUrl,
          marketId:user.id
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
  async findAll() {
    return await this.prisma.category.findMany({
      orderBy: { nameAr: 'asc' },
    });
  }

  // ============================
  // 🔥 Find One
  // ============================
  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  // ============================
  // 🔥 Update Category
  // ============================
  async update(id: string, dto: UpdateCategoryDto, user: any) {
    try {
      if (user.type !== 'OWNER') {
        throw new UnauthorizedException('Only OWNER can update categories');
      }

      const category = await this.prisma.category.findUnique({ where: { id } });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      let imageUrl = category.icon;

      if (dto.icon) {
        imageUrl = await this.cloudinary.uploadImageFromBase64(
          dto.icon,
          'categories',
        );
      }

      return await this.prisma.category.update({
        where: { id },
        data: {
          nameAr: dto.nameAr ?? category.nameAr,
          nameEn: dto.nameEn ?? category.nameEn,
          icon: imageUrl,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        err.message || 'Failed to update category',
      );
    }
  }

  // ============================
  // 🔥 Delete Category (Transaction)
  // ============================
  async remove(id: string, user: any) {
    try {
      if (user.type !== 'OWNER') {
        throw new UnauthorizedException('Only OWNER can delete categories');
      }

      // 🔍 Check if category exists
      const category = await this.prisma.category.findUnique({ where: { id } });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      return await this.prisma.$transaction(async (tx) => {
        // ❗ Delete category only
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
