import { UserPlanEntity } from './userPlan.entity';
import { ServiceCategoryPlanEntity } from './service-category-plan.entity';
export declare class PlanEntity {
    idPlan: number;
    name: string;
    description: string;
    price: number;
    customPrice: any;
    userPlans: UserPlanEntity[];
    serviceCategoryPlans: ServiceCategoryPlanEntity[];
}
