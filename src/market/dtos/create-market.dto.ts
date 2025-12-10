import { IsString, IsOptional, IsArray, IsNumber } from "class-validator";

export class CreateMarketDto {
  @IsOptional() @IsString() nameAr?: string;
  @IsOptional() @IsString() nameEn?: string;
  @IsOptional() @IsString() descriptionAr?: string;
  @IsOptional() @IsString() descriptionEn?: string;
  @IsString() ownerId; // لازم يكون موجود

  @IsOptional() @IsString() zone?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsArray() operations?: string[];
  @IsOptional() @IsArray() hours?: string[];
  @IsOptional() @IsNumber() commissionFee?: number;
  @IsOptional() @IsArray() location?: number[];
  @IsOptional() @IsArray() categoryIds?: string[]; // IDs of categories to link
}
