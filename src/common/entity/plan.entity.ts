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

  // Estas columnas se agregarán ejecutando las queries SQL
  // @Column({ type: 'varchar', nullable: true })
  // icon: string;
  
  // @Column({ type: 'jsonb', nullable: true })
  // priceDetails: any;
  
  // @Column({ type: 'jsonb', nullable: true })
  // customPrice: any;
  
  // @Column({ type: 'jsonb', nullable: true })
  // features: string[];

  @OneToMany(() => UserPlanEntity, (userPlan) => userPlan.plan)
  userPlans: UserPlanEntity[];

  @OneToMany(
    () => ServiceCategoryPlanEntity,
    (serviceCategoryPlan) => serviceCategoryPlan.plan,
  )
  serviceCategoryPlans: ServiceCategoryPlanEntity[];
}
