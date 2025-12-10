import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  nameAr: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
