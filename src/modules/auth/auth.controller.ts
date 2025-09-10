import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../../common/dto/auth-create.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../../common/dto/auth-login.dto';
import { Throttle } from '@nestjs/throttler';
import { TokenUserDto } from '../../common/dto/auth-token.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/RolesGuard';
import { Role } from '../../enum/roles.enum';
import { Roles } from '../../decorators/roles.decorator';
import { ConfirmPasswordResetDto } from './dto/confirmPassword.dto';
import { ResetPasswordDto } from './dto/resetPass.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authSerivice: AuthService) {}

  @Post('login')
  async login(@Body() loginUser: LoginUserDto) {
    return this.authSerivice.loginUser(loginUser);
  }
  @Post('validToken')
  async validToken(@Body() data: TokenUserDto) {
    return await this.authSerivice.validToken(data.token);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('register')
  async createAccount(@Body() createUser: CreateUserDto): Promise<any> {
    return this.authSerivice.createAccountUser(createUser);
  }
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('resetPassword')
  async resetPassword(@Body() data: ResetPasswordDto) {
    return this.authSerivice.resetPasswordUser(data);
  }
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('confirmPasswordReset')
  async confirmPasswordReset(@Body() data: ConfirmPasswordResetDto) {
    return this.authSerivice.confirmPasswordReset(data);
  }
}
