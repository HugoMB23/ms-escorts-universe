import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PlanEntity } from './plan.entity'; // Ajusta la ruta según sea necesario

@Entity('plan_category')
export class PlanCategoryEntity {
  @PrimaryGeneratedColumn('increment')
  idCategory: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => PlanEntity, (plan) => plan.category)
  plans: PlanEntity[]; // Relación OneToMany con PlanEntity
}
