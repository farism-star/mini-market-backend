import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { OrderStatus } from '@prisma/client'; // prisma enum types if available

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  orderId?: string;

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
  @IsString()
  time?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
