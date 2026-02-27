import { CouponService } from './coupon.service';
import { GenerateCouponDto } from './dto/generate-coupon.dto';
import { RedeemCouponDto } from './dto/redeem-coupon.dto';
import { CouponStatus } from '../../enum/couponStatus.enum';
export declare class CouponController {
    private readonly couponService;
    constructor(couponService: CouponService);
    generateCoupons(dto: GenerateCouponDto): Promise<{
        codes: string[];
    }>;
    redeemCoupon(dto: RedeemCouponDto, userUuid: string): Promise<{
        success: boolean;
        message: string;
        planName: string;
        planEndDate: string;
    }>;
    findAll(status?: CouponStatus, idPlan?: string): Promise<import("../../common/entity/coupon.entity").CouponEntity[]>;
    findByCode(code: string): Promise<import("../../common/entity/coupon.entity").CouponEntity>;
}
