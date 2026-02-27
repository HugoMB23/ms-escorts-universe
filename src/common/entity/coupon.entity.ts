import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PlanEntity } from './plan.entity';
import { CouponStatus } from '../../enum/couponStatus.enum';

@Entity('coupon')
export class CouponEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'int' })
  idPlan: number;

  @ManyToOne(() => PlanEntity, { nullable: false })
  @JoinColumn({ name: 'idPlan' })
  plan: PlanEntity;

  @Column({ type: 'int' })
  durationDays: number;

  @Column({ type: 'timestamptz' })
  validFrom: Date;

  @Column({ type: 'timestamptz' })
  validUntil: Date;

  @Column({
    type: 'enum',
    enum: CouponStatus,
    default: CouponStatus.ACTIVE,
  })
  status: CouponStatus;

  @Column({ type: 'varchar', nullable: true })
  usedByUserUuid: string;

  @Column({ type: 'timestamptz', nullable: true })
  usedAt: Date;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
