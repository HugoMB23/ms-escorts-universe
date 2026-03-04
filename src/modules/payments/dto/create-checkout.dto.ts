import { IsString, IsNumber, IsOptional, IsObject, Min, IsIn } from 'class-validator';

export class CreateCheckoutDto {
  @IsString()
  externalReference: string; // bookingId, serviceId, userId, etc.

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  currency: string; // 'CLP', 'USD', etc.

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  provider?: string; // 'mercadopago', 'stripe', etc. Default: 'mercadopago'

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  /**
   * Plan name (e.g., 'escort-supernova')
   * Backend extracts the plan name after the hyphen: 'supernova'
   */
  @IsOptional()
  @IsString()
  planName?: string;

  /**
   * Plan duration in days: 7, 15, or 30
   */
  @IsOptional()
  @IsIn([7, 15, 30])
  planDays?: number;
}
