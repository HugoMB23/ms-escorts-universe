import { IsNotEmpty, IsString, IsNumber, IsArray, ArrayNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class UpdateProfileInformationDto {

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  height?: string;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsString()
  waist?: string;

  @IsOptional()
  @IsString()
  bust?: string;

  @IsOptional()
  @IsString()
  hips?: string;

  @IsOptional()
  @IsString()
  bodyType?: string;

  @IsOptional()
  @IsString()
  depilation?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  listService?: any[];
}
