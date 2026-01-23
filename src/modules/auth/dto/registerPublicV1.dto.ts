import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';

class Step1Dto {
  @IsNotEmpty()
  @IsString()
  regionType: string;

  @IsNotEmpty()
  @IsString()
  userType: string;

  @IsNotEmpty()
  @IsString()
  priceDays: string;

  @IsOptional()
  @IsString()
  planId?: string;
}

class Step2Dto {
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  birthdate: string;

  @IsNotEmpty()
  @IsString()
  comuna: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsBoolean()
  emailVisible: boolean;

  @IsNotEmpty()
  @IsBoolean()
  hasParking: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isWhatsAppDifferent: boolean;

  @IsNotEmpty()
  @IsString()
  nationality: string;

  @IsNotEmpty()
  @IsString()
  nickname: string;

  @IsNotEmpty()
  @IsBoolean()
  onlyMessages: boolean;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  whatsappPhone?: string;
}

class Step3Dto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  additionalServices: string[];

  @IsNotEmpty()
  @IsString()
  bodyType: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  characteristics: string[];

  @IsNotEmpty()
  @IsNumber()
  height: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsNotEmpty()
  @IsNumber()
  measurementBust: number;

  @IsNotEmpty()
  @IsNumber()
  measurementHips: number;

  @IsNotEmpty()
  @IsNumber()
  measurementWaist: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  services: string[];

  @IsNotEmpty()
  @IsString()
  smoking: string;
}

class GeoDto {
  @IsNotEmpty()
  @IsNumber()
  accuracy: number;

  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @IsNotEmpty()
  @IsNumber()
  timestamp: number;
}

class PhotoMetaDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  size: number;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsNumber()
  lastModified: number;
}

class Step4Dto {
  @IsNotEmpty()
  @IsString()
  documentType: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoDto)
  geolocation?: GeoDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PhotoMetaDto)
  photoProfile: PhotoMetaDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhotoMetaDto)
  photos: PhotoMetaDto[];
}

class Step5Dto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PhotoMetaDto)
  photoPayment: PhotoMetaDto;
}

export class RegisterPublicV1Dto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Step1Dto)
  step1: Step1Dto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Step2Dto)
  step2: Step2Dto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Step3Dto)
  step3: Step3Dto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Step4Dto)
  step4: Step4Dto;

  @IsOptional()
  @ValidateNested()
  @Type(() => Step5Dto)
  step5?: Step5Dto;
}
