import { PlanEntity } from './plan.entity';
import { CouponStatus } from '../../enum/couponStatus.enum';
export declare class CouponEntity {
    id: number;
    code: string;
    idPlan: number;
    plan: PlanEntity;
    durationDays: number;
    validFrom: Date;
    validUntil: Date;
    status: CouponStatus;
    usedByUserUuid: string;
    usedAt: Date;
    createdAt: Date;
}
