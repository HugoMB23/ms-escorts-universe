import { IsNotEmpty, IsString, IsEmail, MinLength, IsNumber } from 'class-validator';
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

