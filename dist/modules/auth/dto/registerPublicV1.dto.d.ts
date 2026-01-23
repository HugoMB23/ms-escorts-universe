declare class Step1Dto {
    regionType: string;
    userType: string;
    priceDays: string;
    planId?: string;
}
declare class Step2Dto {
    address: string;
    birthdate: string;
    comuna: string;
    confirmPassword: string;
    description: string;
    email: string;
    emailVisible: boolean;
    hasParking: boolean;
    isWhatsAppDifferent: boolean;
    nationality: string;
    nickname: string;
    onlyMessages: boolean;
    password: string;
    phoneNumber: string;
    whatsappPhone?: string;
}
declare class Step3Dto {
    additionalServices: string[];
    bodyType: string;
    characteristics: string[];
    height: number;
    weight?: number;
    measurementBust: number;
    measurementHips: number;
    measurementWaist: number;
    services: string[];
    smoking: string;
}
declare class GeoDto {
    accuracy: number;
    latitude: number;
    longitude: number;
    timestamp: number;
}
declare class PhotoMetaDto {
    name: string;
    size: number;
    type: string;
    lastModified: number;
}
declare class Step4Dto {
    documentType: string;
    geolocation?: GeoDto;
    photoProfile: PhotoMetaDto;
    photos: PhotoMetaDto[];
}
declare class Step5Dto {
    photoPayment: PhotoMetaDto;
}
export declare class RegisterPublicV1Dto {
    step1: Step1Dto;
    step2: Step2Dto;
    step3: Step3Dto;
    step4: Step4Dto;
    step5?: Step5Dto;
}
export {};
