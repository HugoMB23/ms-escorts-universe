import { IsInt, IsPositive, IsDateString, Min, Max } from 'class-validator';

export class GenerateCouponDto {
  @IsInt()
  @Min(1)
  @Max(500)
  quantity: number;

  @IsInt()
  @IsPositive()
  idPlan: number;

  @IsInt()
  @Min(1)
  durationDays: number;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validUntil: string;
}
