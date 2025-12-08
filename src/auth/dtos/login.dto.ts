import {  IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum UserType {
  OWNER = 'OWNER',
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
}


export class Login {
  @IsOptional()
  @IsString()
  email?: string;
  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString() 
  phone: string;

}