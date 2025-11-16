import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  @IsString()
  titleAr?: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  categoryId?: string;
}
