import { ServiceCategoryEntity } from './service-category.entity';
import { PlanEntity } from './plan.entity';
export declare class ServiceCategoryPlanEntity {
    idServiceCategoryPlan: number;
    idServiceCategory: number;
    idPlan: number;
    available: boolean;
    serviceCategory: ServiceCategoryEntity;
    plan: PlanEntity;
}
