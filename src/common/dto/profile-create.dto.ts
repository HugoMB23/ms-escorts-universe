import { IsNotEmpty, IsString, IsNumber, IsArray, IsDateString, ValidateNested, ArrayNotEmpty,IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';



export class InformationProfileDto {
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
  @IsString()
  bodyType: string;

  @IsNotEmpty()
  @IsBoolean()
  depilation: boolean;

  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  listService: any[];

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
  @IsBoolean()
  parking: boolean;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}

export class CreateProfileDto {
  @IsNotEmpty()
  @IsString()
  userUuid: string;
  
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => InformationProfileDto)
  informationProfile: InformationProfileDto;
}
