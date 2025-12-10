// dtos/auth.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString,IsArray ,Length, IsBoolean } from 'class-validator';

export enum UserType {
  OWNER = 'OWNER',
  CLIENT = 'CLIENT',
}

export enum AddressType {
  WORK = 'WORK',
  HOME = 'HOME',
  OTHER = 'OTHER',
}

export class AuthDto {
  @IsEnum(UserType)
  type: UserType;

  @IsNotEmpty()
  @IsString()
  name: string;

   @IsNotEmpty()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  image?: string;
  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  marketName?: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

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
  operations?: string[];

  @IsOptional()
  hours?: string[];

    @IsOptional()
  @IsArray()
  location?: number[];
}

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 5)
  otp: string;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  addressId?: string;

  @IsOptional()
  @IsEnum(AddressType)
  type?: AddressType;

  @IsOptional()
  @IsString()
  fullAddress?: string;

  @IsOptional()
  @IsBoolean()
  isSelected?: boolean;
}

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
  operations?: string[];

  @IsOptional()
  hours?: string[];

  @IsOptional()
  @IsString()
  image?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(UserType)
  type?: UserType;

  @IsOptional()
  @IsString()
  image?: string;
  @IsOptional()
  @IsBoolean()
  isAproved?: boolean;

  @IsOptional()
  address?: UpdateAddressDto;

  @IsOptional()
  market?: UpdateMarketDto;
}