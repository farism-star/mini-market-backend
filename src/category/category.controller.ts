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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';

@Controller('categories')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Roles(Role.OWNER)
  @Post()
  create(@Body() dto: CreateCategoryDto, @Req() req: any) {
    const user = req.user
 
    return this.categoryService.create(dto, user);
  }

  @Roles(Role.CLIENT, Role.OWNER)
  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Roles(Role.CLIENT, Role.OWNER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Roles(Role.OWNER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @Req() req: any) {
    const user = req.user
    return this.categoryService.update(id, dto,user);
  }

  @Roles(Role.OWNER)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.categoryService.remove(id,req);
  }
}
