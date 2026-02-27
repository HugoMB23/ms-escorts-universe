import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { GenerateCouponDto } from './dto/generate-coupon.dto';
import { RedeemCouponDto } from './dto/redeem-coupon.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/RolesGuard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '../../enum/roles.enum';
import { JwtToken } from '../../common/decorators/jwt-token.decorator';
import { CouponStatus } from '../../enum/couponStatus.enum';

@Controller('coupon')
@UseGuards(JwtAuthGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('generate')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  async generateCoupons(@Body() dto: GenerateCouponDto) {
    return this.couponService.generateCoupons(dto);
  }

  @Post('redeem')
  @HttpCode(HttpStatus.OK)
  async redeemCoupon(
    @Body() dto: RedeemCouponDto,
    @JwtToken() userUuid: string,
  ) {
    return this.couponService.redeemCoupon(dto, userUuid);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  async findAll(
    @Query('status') status?: CouponStatus,
    @Query('idPlan') idPlan?: string,
  ) {
    return this.couponService.findAll({
      status,
      idPlan: idPlan ? parseInt(idPlan, 10) : undefined,
    });
  }

  @Get(':code')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  async findByCode(@Param('code') code: string) {
    return this.couponService.findByCode(code);
  }
}
