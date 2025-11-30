import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePaymentDto {
    @IsOptional()
    @IsString()
    userId: string;

    @IsOptional()
    @IsNumber()
    amount: number;

    @IsOptional()
    @IsString()
    method: string;
    @IsOptional()
    @IsString()
    customerCity: string;
    @IsOptional()
    @IsString()
    customerName: string;
    @IsOptional()
    @IsString()
    customerEmail: string;
    @IsOptional()
    @IsString()
    customerPhone: string;
    @IsOptional()
    @IsString()
    customerAddress?: string;
    @IsOptional()
    @IsString()
    customerState?: string;
    @IsOptional()
    @IsString()
    customerZip?: string;
}