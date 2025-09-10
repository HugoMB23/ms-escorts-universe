import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';

export class TokenUserDto {

  @IsNotEmpty()
  @IsString()
  token: string;
}
