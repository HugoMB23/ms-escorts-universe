import { ServiceCategoryPlanEntity } from './service-category-plan.entity';
export declare class ServiceCategoryEntity {
    idCategory: number;
    name: string;
    slug: string;
    description: string;
    serviceCategoryPlans: ServiceCategoryPlanEntity[];
}
