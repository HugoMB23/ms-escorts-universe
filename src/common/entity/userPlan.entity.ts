import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { PlanEntity } from './plan.entity';

@Entity('user_plan')
export class UserPlanEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id_user_plan' })
  idUserPlan: number;

  @Column({ name: 'user_uuid' })
  userUuid: string;

  @Column({ name: 'id_plan' })
  idPlan: number;

  @Column({ type: 'date', name: 'start_date' })
  startDate: string;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate: string;

  @ManyToOne(() => UserEntity, (user) => user.userPlans, { nullable: false })
  user: UserEntity;

  @ManyToOne(() => PlanEntity)
  @JoinColumn({ name: 'id_plan' })
  plan: PlanEntity;
}
