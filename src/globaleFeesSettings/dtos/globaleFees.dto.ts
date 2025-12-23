import { IsNumber, Min } from 'class-validator';

export class GlobalFeesSettingsDto {
  @IsNumber()
  @Min(0)
  limitFees: number;

  @IsNumber()
  @Min(0)
  feePerOrder: number;

}