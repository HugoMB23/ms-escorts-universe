import { IsNotEmpty, IsString, IsNumber, IsArray, IsDateString, ValidateNested, ArrayNotEmpty } from 'class-validator';

export class CreateProfileDto {
  @IsNotEmpty()
  @IsString()
  userUuid: string;

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
  @IsString()
  depilation: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  listService: any[];

  @IsNotEmpty()
  @IsNumber()
  idPlan: number;

  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @IsNotEmpty()
  @IsDateString()
  endDate: Date;
}
