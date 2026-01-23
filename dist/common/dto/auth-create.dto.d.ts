export declare class CreateUserDto {
    nick: string;
    email: string;
    password: string;
    rol: number;
    birthDate: string;
}
declare class DetailSelectDto {
    typeUser: string;
    plan: string;
    duration: string;
}
declare class ServiceDto {
    serviceName: string;
    serviceDescription: string;
}
export declare class CreateProfilPublicDto {
    nick: string;
    email: string;
    password: string;
    age: number;
    description: string;
    nationality: string;
    tattoos: boolean;
    piercings: boolean;
    smoker: boolean;
    drinker: boolean;
    languages: string;
    eyeColor: string;
    hairColor: string;
    height: string;
    weight: string;
    waist: string;
    bust: string;
    hips: string;
    parking: boolean;
    bodyType: string;
    depilation: boolean;
    birthDate: string;
    detailSelect: DetailSelectDto;
    listService: ServiceDto[];
}
export {};
