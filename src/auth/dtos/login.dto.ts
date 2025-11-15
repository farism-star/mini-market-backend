import {  IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum UserType {
  OWNER = 'OWNER',
  CLIENT = 'CLIENT',
}


export class Login {
  @IsOptional()
  @IsString()
  email?: string;

  @IsNotEmpty()
  @IsString() 
  phone: string;

}