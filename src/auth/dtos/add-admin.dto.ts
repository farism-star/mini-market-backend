import {  IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class AddAdminDto {
  @IsNotEmpty()
  @IsString()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
  @IsOptional()
  @IsString()
  name?: string;



}