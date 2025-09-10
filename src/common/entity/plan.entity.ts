import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserPlanEntity } from './userPlan.entity'; // Ajusta la ruta según sea necesario
import { PlanCategoryEntity } from './planCategory.entity'; // Ajusta la ruta según sea necesario

@Entity('plan')
export class PlanEntity {
  @PrimaryGeneratedColumn('increment')
  idPlan: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'numeric' })
  price: number;

  @Column({ type: 'int' })
  idCategory: number; // Mantén esta columna

  @ManyToOne(() => PlanCategoryEntity, (category) => category.plans, { nullable: false })
  @JoinColumn({ name: 'idCategory' }) // Especifica que esta columna es la clave foránea
  category: PlanCategoryEntity; // Relación ManyToOne con PlanCategoryEntity

  @OneToMany(() => UserPlanEntity, (userPlan) => userPlan.plan)
  userPlans: UserPlanEntity[]; // Relación OneToMany con UserPlanEntity
}
