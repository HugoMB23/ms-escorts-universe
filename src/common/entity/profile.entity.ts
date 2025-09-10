import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity'; // Ajusta la ruta según sea necesario

@Entity('profile')
export class ProfileEntity {
  @PrimaryGeneratedColumn('increment')
  idProfile: number;

  @Column()
  userUuid: string;

  @Column()
  age: number;

  @Column()
  description: string;

  @Column()
  nationality: string;

  @Column()
  height: string;

  @Column()
  weight: string;

  @Column()
  waist: string;

  @Column()
  bust: string;

  @Column()
  hips: string;

  @Column()
  bodyType: string;

  @Column()
  depilation: string;

  @Column()
  tattoos: string;

  @Column()
  piercings: string;

  @Column()
  smoker: string;

  @Column()
  drinker: string;

  @Column()
  languages: string;

  @Column()
  eyeColor: string;

  @Column()
  hairColor: string;

  @Column('jsonb')
  listService: any; // Considerar cambiar a un tipo más específico si es necesario

  @OneToOne(() => UserEntity, (user) => user.profile)
  @JoinColumn({ name: 'userUuid' })
  user: UserEntity; // Relación OneToOne con UserEntity
}
