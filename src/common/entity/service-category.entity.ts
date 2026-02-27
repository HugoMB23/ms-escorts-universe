import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ServiceCategoryPlanEntity } from './service-category-plan.entity';

@Entity('service_category')
export class ServiceCategoryEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id_category' })
  idCategory: number;

  @Column({ type: 'varchar', length: 100 })
  name: string; // ej: "Escort", "Trans", "Fantasía", "Masajista Mujer", etc.

  @Column({ type: 'varchar', length: 100 })
  slug: string; // ej: "escort", "escort-trans", "escort-fantasia", etc.

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(
    () => ServiceCategoryPlanEntity,
    (serviceCategoryPlan) => serviceCategoryPlan.serviceCategory,
  )
  serviceCategoryPlans: ServiceCategoryPlanEntity[];
}
