import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  Query
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../upload/multer.config';

@Controller({
  path: 'products',
  version: '1'
})
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Roles(Role.OWNER)
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig)) // ✅ رفع 10 صور كحد أقصى
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreateProductDto,
    @Req() req: any
  ) {
    const ownerId = req.user.id;
    const imageUrls = files?.map(file => `/uploads/${file.filename}`) || [];
    return this.productService.create(ownerId, dto, imageUrls);
  }

 @Roles(Role.CLIENT, Role.OWNER)
@Get()
findAll(@Req() req, @Query() query) {
  return this.productService.findAll(req.user, query);
}


  @Roles(Role.OWNER)
  @Get('owner/me')
  findMyProducts(@Req() req) {
    return this.productService.findByOwner(req.user.id);
  }

  @Roles(Role.CLIENT, Role.OWNER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Roles(Role.OWNER)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig)) // ✅ رفع 10 صور كحد أقصى
  update(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UpdateProductDto,
    @Req() req: any
  ) {
    const user = req.user;
    const imageUrls = files?.map(file => `/uploads/${file.filename}`) || [];
    return this.productService.update(id, dto, user, imageUrls);
  }

  @Roles(Role.OWNER)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    return this.productService.remove(id, user);
  }
}