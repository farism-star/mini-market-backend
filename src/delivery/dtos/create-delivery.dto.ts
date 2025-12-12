import { IsOptional, IsString } from "class-validator";

export class CreateDeliveryDto {
  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  image?: string;


  @IsOptional()
  @IsString()
  marketId?: string;
}
