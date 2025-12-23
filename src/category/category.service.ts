import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  // إنشاء Category بدون ربطها بأي Market
  async create(dto: CreateCategoryDto, iconUrl: string | null) {
    const category = await this.prisma.category.create({
      data: {
        nameAr: dto.nameAr ?? '',
        nameEn: dto.nameEn ?? '',
        icon: iconUrl ?? '',
      },
    });

    return { message: 'Category created', category };
  }

async findAll() {
  const categories = await this.prisma.category.findMany({
    include: {
      markets: {
        include: {
          market: true, 
        },
      },
    },
  });

  // تحويل النتيجة عشان تبقى الماركت مباشرة بدل MarketCategory
  const formattedCategories = categories.map(category => ({
    ...category,
    markets: category.markets.map(mc => mc.market),
  }));

  return { categories: formattedCategories };
}

  async findOne(id: string) {
  const category = await this.prisma.category.findUnique({
    where: { id },
    include: {
      markets: {
        include: {
          market: true, // يجلب بيانات الماركت المرتبط
        },
      },
    },
  });

  if (!category) throw new NotFoundException('Category not found');

  // تحويل النتيجة عشان تبقى الماركت مباشرة بدل MarketCategory
  const formattedCategory = {
    ...category,
    markets: category.markets.map(mc => mc.market),
  };

  return { category: formattedCategory };
}


  async update(id: string, dto: UpdateCategoryDto, iconUrl: string | null) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        nameAr: dto.nameAr ?? category.nameAr,
        nameEn: dto.nameEn ?? category.nameEn,
        icon: iconUrl ?? category.icon,
      },
    });

    return { message: 'Category updated', updated };
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({ 
      where: { id },
      include: { markets: true } // ✅ جيب الماركتس المرتبطة
    });
    
    if (!category) throw new NotFoundException('Category not found');
  
    // ✅ امسح العلاقات في MarketCategory الأول
    await this.prisma.marketCategory.deleteMany({
      where: { categoryId: id }
    });
  
    // ✅ دلوقتي امسح الـ Category
    await this.prisma.category.delete({ where: { id } });
    
    return { message: 'Category deleted' };
  }
}
