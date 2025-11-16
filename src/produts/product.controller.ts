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
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';

@Controller('products')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Roles(Role.OWNER)
  @Post()
  create(@Req() req, @Body() dto: CreateProductDto) {
    const ownerId = req.user.id;
    return this.productService.create(ownerId, dto);
  }

@Roles(Role.CLIENT, Role.OWNER)
@Get()
findAll(@Req() req) {
  return this.productService.findAll(req.user);
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
  update(@Param('id') id: string, @Body() dto: UpdateProductDto, @Req() req: any) {
    const user = req.user
    return this.productService.update(id, dto,user);
  }

  @Roles(Role.OWNER)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const user = req.user
    return this.productService.remove(id,user);
  }
}
