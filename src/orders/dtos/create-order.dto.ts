import { IsOptional, IsString, IsDateString, IsEnum,IsNumber } from 'class-validator';
import { OrderStatus } from '@prisma/client'; // prisma enum types if available

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  orderId?: string;
  @IsOptional()
  @IsString()
  deliveryId?: string;

  @IsOptional()
  @IsString()
  clientId?: string; 

  @IsOptional()
  @IsString()
  marketId?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  time?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;


  @IsOptional()
  @IsNumber()
  rate?:number;
}
