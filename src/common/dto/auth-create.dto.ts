import { IsNotEmpty, IsString, IsEmail, MinLength, IsNumber,ValidateNested,ArrayNotEmpty,IsArray,IsBoolean} from 'class-validator';
import { Type } from 'class-transformer';
import { OmitType } from '@nestjs/mapped-types';


export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
   nick: string;

  @IsNotEmpty()
  @IsEmail()
   email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsNumber()
  rol: number;

  @IsNotEmpty()
  @IsString()
  birthDate: string;

}
class DetailSelectDto {
  @IsNotEmpty()
  @IsString()
  typeUser: string;

  @IsNotEmpty()
  @IsString()
  plan: string;

  @IsNotEmpty()
  @IsString()
  duration: string;
}
class ServiceDto {
  @IsNotEmpty()
  @IsString()
  serviceName: string;

  @IsNotEmpty()
  @IsString()
  serviceDescription: string;
}
export class CreateProfilPublicDto {
  @IsNotEmpty()
  @IsString()
  nick: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsNumber()
  age: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  nationality: string;

  @IsNotEmpty()
  @IsBoolean()
  tattoos: boolean;

  @IsNotEmpty()
  @IsBoolean()
  piercings: boolean;

  @IsNotEmpty()
  @IsBoolean()
  smoker: boolean;

  @IsNotEmpty()
  @IsBoolean()
  drinker: boolean;

  @IsNotEmpty()
  @IsString()
  languages: string;
  
  @IsNotEmpty()
  @IsString()
  eyeColor: string;

  @IsNotEmpty()
  @IsString()
  hairColor: string;

  @IsNotEmpty()
  @IsString()
  height: string;

  @IsNotEmpty()
  @IsString()
  weight: string;

  @IsNotEmpty()
  @IsString()
  waist: string;

  @IsNotEmpty()
  @IsString()
  bust: string;

  @IsNotEmpty()
  @IsString()
  hips: string;

  @IsNotEmpty()
  @IsBoolean()
  parking: boolean;

  @IsNotEmpty()
  @IsString()
  bodyType: string;

  @IsNotEmpty()
  @IsBoolean()
  depilation: boolean;
  
  @IsNotEmpty()
  @IsString()
  birthDate: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DetailSelectDto)
  detailSelect: DetailSelectDto;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ServiceDto)
  listService: ServiceDto[];
}

