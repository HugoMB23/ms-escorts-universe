import { UserEntity } from './user.entity';
export declare class ProfileEntity {
    idProfile: number;
    userUuid: string;
    age: number;
    description: string;
    nationality: string;
    height: string;
    weight: string;
    waist: string;
    bust: string;
    hips: string;
    bodyType: string;
    depilation: boolean;
    tattoos: boolean;
    piercings: boolean;
    smoker: boolean;
    drinker: boolean;
    languages: string;
    eyeColor: string;
    hairColor: string;
    listService: any;
    parking: boolean;
    startDate: string;
    endDate: string;
    user: UserEntity;
}
