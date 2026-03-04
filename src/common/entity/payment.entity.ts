import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { PaymentStatus } from '../../enum/paymentStatus.enum';

@Entity('payment')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userUuid: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userUuid' })
  user: UserEntity;

  @Column({ type: 'varchar', length: 100 })
  provider: string; // 'mercadopago', 'stripe', etc.

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10 })
  currency: string; // 'CLP', 'USD', etc.

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  // External reference for source of truth
  @Column({ type: 'varchar', nullable: true })
  externalId: string; // paymentId from provider

  // Link to internal resource (booking, service, etc.)
  @Column({ type: 'varchar', nullable: true })
  externalReference: string; // bookingId, serviceId, etc.

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional data from provider

  // Error details if status is ERROR
  @Column({ type: 'text', nullable: true })
  errorMessage: string; // Error message from provider or processing

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
