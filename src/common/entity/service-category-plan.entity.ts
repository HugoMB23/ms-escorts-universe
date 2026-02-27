import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ServiceCategoryEntity } from './service-category.entity';
import { PlanEntity } from './plan.entity';

@Entity('service_category_plan')
export class ServiceCategoryPlanEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id_service_category_plan' })
  idServiceCategoryPlan: number;

  @Column({ name: 'id_service_category' })
  idServiceCategory: number;

  @Column({ name: 'id_plan' })
  idPlan: number;

  @Column({ type: 'boolean', default: true })
  available: boolean; // Por si en futuro quieres deshabilitar categorías en ciertos planes

  @ManyToOne(
    () => ServiceCategoryEntity,
    (serviceCategory) => serviceCategory.serviceCategoryPlans,
    { nullable: false },
  )
  @JoinColumn({ name: 'id_service_category' })
  serviceCategory: ServiceCategoryEntity;

  @ManyToOne(() => PlanEntity, (plan) => plan.serviceCategoryPlans, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_plan' })
  plan: PlanEntity;
}
