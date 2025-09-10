import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { PlanEntity } from './plan.entity';

@Entity('user_plan')
export class UserPlanEntity {
  @PrimaryGeneratedColumn('increment')
  idUserPlan: number;

  @Column()
  userUuid: string;

  @Column()
  idPlan: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string;

  @ManyToOne(() => UserEntity, (user) => user.userPlans, { nullable: false })
  user: UserEntity;

  @ManyToOne(() => PlanEntity)
  @JoinColumn({ name: 'idPlan' })
  plan: PlanEntity;
}
