import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  marketId?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
