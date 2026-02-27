import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { CouponEntity } from '../../common/entity/coupon.entity';
import { PlanEntity } from '../../common/entity/plan.entity';
import { UserPlanEntity } from '../../common/entity/userPlan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CouponEntity, PlanEntity, UserPlanEntity])],
  controllers: [CouponController],
  providers: [CouponService],
})
export class CouponModule {}
