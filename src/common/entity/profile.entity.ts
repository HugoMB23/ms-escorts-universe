import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity'; // Ajusta la ruta según sea necesario

@Entity('profile')
export class ProfileEntity {
  @PrimaryGeneratedColumn('increment')
  idProfile: number;

  @Column()
  userUuid: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  nationality: string;

  @Column({ type: 'varchar', length: 20 })
  height: string;

  @Column({ type: 'varchar', length: 20 })
  weight: string;

  @Column({ type: 'varchar', length: 20 })
  waist: string;

  @Column({ type: 'varchar', length: 20 })
  bust: string;

  @Column({ type: 'varchar', length: 20 })
  hips: string;

  @Column({ type: 'varchar', length: 50 })
  bodyType: string;

  @Column({ type: 'boolean', default: false })
  depilation: boolean;

  @Column({ type: 'boolean', default: false })
  tattoos: boolean;

  @Column({ type: 'boolean', default: false })
  piercings: boolean;

  @Column({ type: 'boolean', default: false })
  smoker: boolean;

  @Column({ type: 'boolean', default: false })
  drinker: boolean;

  @Column({ type: 'varchar', length: 150 })
  languages: string;

  @Column({ type: 'varchar', length: 50 })
  eyeColor: string;

  @Column({ type: 'varchar', length: 50 })
  hairColor: string;

  @Column({ type: 'jsonb' })
  listService: any;

  @Column({ type: 'boolean', default: false })
  parking: boolean;
  
  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @OneToOne(() => UserEntity, (user) => user.profile)
  @JoinColumn({ name: 'userUuid', referencedColumnName: 'uuid' })
  user: UserEntity;
}
