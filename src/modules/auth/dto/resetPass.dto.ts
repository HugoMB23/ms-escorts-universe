import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'El correo electrónico proporcionado no es válido.' })
  @IsNotEmpty({ message: 'El campo de correo electrónico no puede estar vacío.' })
  email: string;
}
