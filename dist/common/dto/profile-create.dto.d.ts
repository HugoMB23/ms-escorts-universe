export declare class InformationProfileDto {
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
    listService: any[];
    tattoos: boolean;
    piercings: boolean;
    smoker: boolean;
    drinker: boolean;
    languages: string;
    eyeColor: string;
    hairColor: string;
    parking: boolean;
    startDate: string;
    endDate: string;
}
export declare class CreateProfileDto {
    userUuid: string;
    informationProfile: InformationProfileDto;
}
