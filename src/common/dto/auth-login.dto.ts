import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';

export class LoginUserDto {

  @IsNotEmpty()
  @IsEmail()
   email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
