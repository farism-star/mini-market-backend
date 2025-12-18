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
  UploadedFile,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../upload/multer.config';

@Controller({
  path: 'categories',
  version: '1',
})

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
@UseGuards(AuthGuard('jwt'), RolesGuard) 
 @Roles(Role.OWNER,Role.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('icon', multerConfig))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateCategoryDto,
  ) {
    const iconUrl = file ? `/uploads/${file.filename}` : null;
    return this.categoryService.create(dto, iconUrl);
  }


  @Get()
  findAll() {
    return this.categoryService.findAll();
  }
@UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.CLIENT, Role.OWNER,Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }
@UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OWNER,Role.ADMIN)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('icon', multerConfig))
  update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateCategoryDto,
  ) {
    const iconUrl = file ? `/uploads/${file.filename}` : null;
    return this.categoryService.update(id, dto, iconUrl);
  }
@UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OWNER,Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}

