import { IsOptional, IsString, IsArray } from "class-validator";

export class UpdateMarketDto {
  @IsOptional()
  @IsString()
  name?: string;

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
}
