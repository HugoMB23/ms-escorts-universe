import { IsString, IsNotEmpty, Length } from 'class-validator';

export class RedeemCouponDto {
  @IsString()
  @IsNotEmpty()
  @Length(22, 22)
  code: string;
}
