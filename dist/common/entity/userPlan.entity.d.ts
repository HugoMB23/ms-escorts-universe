import { UserEntity } from './user.entity';
import { PlanEntity } from './plan.entity';
export declare class UserPlanEntity {
    idUserPlan: number;
    userUuid: string;
    idPlan: number;
    startDate: string;
    endDate: string;
    user: UserEntity;
    plan: PlanEntity;
}
