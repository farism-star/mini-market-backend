import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryModule } from '../category/category.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [CategoryModule], 
  controllers: [ProductController],
  providers: [ProductService, PrismaService,CloudinaryService],
})
export class ProductModule {}
