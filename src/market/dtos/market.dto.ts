import { IsOptional, IsString, IsArray, IsNumber, IsBoolean, IsDate } from "class-validator";

export class UpdateMarketDto {
  @IsOptional()
  @IsString()
  nameAr?: string;
  @IsOptional()
  @IsString()
  nameEn?: string;
  @IsOptional()
  @IsString()
  descriptionAr?: string;
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsOptional()
  @IsString()
  zone?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsArray()
  operations?: string[];

  @IsOptional()
  @IsArray()
  hours?: string[];

  @IsOptional()
  @IsNumber()
  commissionFee?: number;

  @IsOptional()
  @IsArray()
  location?: number[];

  @IsOptional()
  @IsNumber()
  rate?: number;

  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;

  @IsOptional()
  @IsDate()
  from?: Date;

  @IsOptional()
  @IsDate()
  to?: Date;
  
   @IsOptional()
    @IsArray() 
    categoryIds?: string[];

}
