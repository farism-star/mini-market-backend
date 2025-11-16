import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, PrismaService,CloudinaryService],
  exports: [CategoryService,PrismaService], // لو هتحتاجه في موديل تاني
})
export class CategoryModule {}
