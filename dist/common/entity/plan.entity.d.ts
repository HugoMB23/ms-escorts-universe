import { UserPlanEntity } from './userPlan.entity';
import { PlanCategoryEntity } from './planCategory.entity';
export declare class PlanEntity {
    idPlan: number;
    name: string;
    description: string;
    price: number;
    idCategory: number;
    category: PlanCategoryEntity;
    userPlans: UserPlanEntity[];
}
