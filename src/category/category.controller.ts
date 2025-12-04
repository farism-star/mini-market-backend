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
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Roles(Role.OWNER)
  @Post()
  @UseInterceptors(FileInterceptor('icon', multerConfig)) // ✅
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateCategoryDto,
    @Req() req: any,
  ) {
    const iconUrl = file ? `/uploads/${file.filename}` : null;
    return this.categoryService.create(dto, req.user, iconUrl);
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
  @UseInterceptors(FileInterceptor('icon', multerConfig)) // ✅
  update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateCategoryDto,
    @Req() req: any,
  ) {
    const iconUrl = file ? `/uploads/${file.filename}` : null;
    return this.categoryService.update(id, dto, req.user, iconUrl);
  }

  @Roles(Role.OWNER)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.categoryService.remove(id, req.user);
  }
}