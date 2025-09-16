import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('plans_config')
export class PlansConfigEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  version: number;

  @Column({ type: 'jsonb' })
  plans: any; // Puedes tiparlo si defines una interfaz para el JSON

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
