import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany } from 'typeorm';
import { ProfileEntity } from './profile.entity'; // Ajusta la ruta según sea necesario
import { UserPlanEntity } from './userPlan.entity'; // Ajusta la ruta según sea necesario

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ nullable: true })
  nick: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  rol: number;

  @Column({ type: 'varchar', nullable: true })
  birthDate: string;

  @Column({ type: 'varchar', nullable: true })
  resetToken: string;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiration: Date;

  @OneToOne(() => ProfileEntity, (profile) => profile.user)
  profile?: ProfileEntity;

  @OneToMany(() => UserPlanEntity, (userPlan) => userPlan.user)
  userPlans: UserPlanEntity[]; // Relación OneToMany con UserPlanEntity
}
