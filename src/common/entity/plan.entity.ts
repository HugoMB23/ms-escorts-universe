import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserPlanEntity } from './userPlan.entity';
import { ServiceCategoryPlanEntity } from './service-category-plan.entity';

@Entity('plan')
export class PlanEntity {
  @PrimaryGeneratedColumn('increment')
  idPlan: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'numeric', nullable: true })
  price: number;

  @Column({ type: 'jsonb', nullable: true })
  customPrice: any; // Precios especiales por región

  @Column({ type: 'varchar', nullable: true })
  icon: string;

  @Column({ type: 'jsonb', nullable: true })
  priceDetails: any; // [{ label: "7 días", price: "$50.000", value: "7d" }, ...]

  @Column({ type: 'jsonb', nullable: true })
  features: any; // Array de features del plan

  @OneToMany(() => UserPlanEntity, (userPlan) => userPlan.plan)
  userPlans: UserPlanEntity[];

  @OneToMany(
    () => ServiceCategoryPlanEntity,
    (serviceCategoryPlan) => serviceCategoryPlan.plan,
  )
  serviceCategoryPlans: ServiceCategoryPlanEntity[];
}
