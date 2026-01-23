import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class RegisterDto {
  // Step 1
  @IsNotEmpty()
  @IsString()
  regionType: string;

  @IsNotEmpty()
  @IsString()
  userType: string;

  @IsNotEmpty()
  @IsString()
  priceDays: string;

  @IsNotEmpty()
  @IsString()
  planId: string;

  // Step 2
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  emailVisible: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  nickname: string;

  @IsNotEmpty()
  birthdate: string;

  @IsNotEmpty()
  @IsString()
  nationality: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsString()
  isWhatsAppDifferent: string;

  @IsString()
  onlyMessages: string;

  @IsOptional()
  @IsString()
  whatsappPhone?: string;

  @IsNotEmpty()
  @IsString()
  comuna: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsString()
  hasParking: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  // Step 3
  @IsNotEmpty()
  @IsString()
  height: string;

  @IsString()
  characteristics: string; // JSON string

  @IsString()
  services: string; // JSON string

  @IsOptional()
  @IsString()
  additionalServices?: string; // JSON string

  @IsNotEmpty()
  @IsString()
  bodyType: string;

  @IsNotEmpty()
  @IsString()
  smoking: string;

  // Step 4
  @IsNotEmpty()
  @IsString()
  documentType: string;

  @IsOptional()
  @IsString()
  geolocation?: string;
}