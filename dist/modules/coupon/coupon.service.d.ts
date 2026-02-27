import { Repository } from 'typeorm';
import { CouponEntity } from '../../common/entity/coupon.entity';
import { PlanEntity } from '../../common/entity/plan.entity';
import { UserPlanEntity } from '../../common/entity/userPlan.entity';
import { CouponStatus } from '../../enum/couponStatus.enum';
import { GenerateCouponDto } from './dto/generate-coupon.dto';
import { RedeemCouponDto } from './dto/redeem-coupon.dto';
export declare class CouponService {
    private couponRepository;
    private planRepository;
    private userPlanRepository;
    constructor(couponRepository: Repository<CouponEntity>, planRepository: Repository<PlanEntity>, userPlanRepository: Repository<UserPlanEntity>);
    generateCoupons(dto: GenerateCouponDto): Promise<{
        codes: string[];
    }>;
    redeemCoupon(dto: RedeemCouponDto, userUuid: string): Promise<{
        success: boolean;
        message: string;
        planName: string;
        planEndDate: string;
    }>;
    findAll(filters?: {
        status?: CouponStatus;
        idPlan?: number;
    }): Promise<CouponEntity[]>;
    findByCode(code: string): Promise<CouponEntity>;
}
