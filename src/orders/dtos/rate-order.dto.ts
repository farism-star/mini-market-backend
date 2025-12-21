import { IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';

export class RateOrderDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rate: number;

}