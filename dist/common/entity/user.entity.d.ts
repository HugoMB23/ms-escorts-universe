import { ProfileEntity } from './profile.entity';
import { UserPlanEntity } from './userPlan.entity';
export declare class UserEntity {
    uuid: string;
    nick: string;
    password: string;
    email: string;
    rol: number;
    birthDate: string;
    resetToken: string;
    resetTokenExpiration: Date;
    profile?: ProfileEntity;
    userPlans: UserPlanEntity[];
}
