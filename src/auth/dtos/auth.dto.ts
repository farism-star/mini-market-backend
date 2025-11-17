import { IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';

export enum UserType {
  OWNER = 'OWNER',
  CLIENT = 'CLIENT',
}

export class AuthDto {
  @IsEnum(UserType)
  type: UserType;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  marketName?: string;

  @IsNotEmpty()
  @IsString() // null يسمح بأي صيغة رقم دولي
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