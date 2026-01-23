import { Body, Controller, Get, Post, UseGuards,Version,UseInterceptors,UploadedFiles} from '@nestjs/common';
import { CreateUserDto,CreateProfilPublicDto } from '../../common/dto/auth-create.dto';
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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { RegisterDto } from './dto/registerPublic.dto'
import { RegisterPublicV1Dto } from './dto/registerPublicV1.dto'
import { ValidationPipe } from '@nestjs/common';


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

  // @Post('registerPublic')
  // async createAccountPublic(@Body() createUser: CreateProfilPublicDto): Promise<any> {
  //   return this.authSerivice.createAccountUserPublic(createUser);
  // }
  
  @Post('registerPublic')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photos', maxCount: 10 },
      { name: 'photoProfile', maxCount: 1 },
      { name: 'photoPayment', maxCount: 5 },
    ]),
  )
  async register(
    @Body() registerDto: RegisterDto,
    @UploadedFiles()
    files: {
      photos?: Express.Multer.File[];
      photoProfile?: Express.Multer.File[];
      photoPayment?: Express.Multer.File[];
    },
  ) {

    const parsedData = {
      ...registerDto,
      characteristics: JSON.parse(registerDto.characteristics as any),
      services: JSON.parse(registerDto.services as any),
      additionalServices: JSON.parse(registerDto.additionalServices as any),
      geolocation: registerDto.geolocation
        ? JSON.parse(registerDto.geolocation as any)
        : null,
      birthdate: new Date(registerDto.birthdate),
      emailVisible: registerDto.emailVisible === 'true',
      isWhatsAppDifferent: registerDto.isWhatsAppDifferent === 'true',
      onlyMessages: registerDto.onlyMessages === 'true',
      hasParking: registerDto.hasParking === 'true',
      photos: files.photos || [],
      photoProfile: files.photoProfile?.[0],
      photoPayment: files.photoPayment || [],
    };
  return this.authSerivice.createAccountUserPublic(parsedData as any);
  }

  // Versioned endpoint for public registration v1 with file upload
  // Accepts: fotoProfile (1), fotoCarnet (1), fotoPago (1-2, can be photo or PDF)
  @Post('registerform')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'fotoProfile', maxCount: 1 },
      { name: 'fotoCarnet', maxCount: 1 },
      { name: 'fotoPago', maxCount: 2 },
    ]),
  )
  async registerPublicV1(
    @Body() bodyRaw: any,
    @UploadedFiles() files: { [fieldname: string]: Express.Multer.File[] },
  ) {
    // Parse JSON from form-data field if it's a string
    let body: RegisterPublicV1Dto;
    try {
      if (typeof bodyRaw === 'string') {
        body = JSON.parse(bodyRaw);
      } else if (bodyRaw.body && typeof bodyRaw.body === 'string') {
        body = JSON.parse(bodyRaw.body);
      } else {
        body = bodyRaw;
      }
      
      // Validate using ValidationPipe
      const validationPipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
      body = await validationPipe.transform(body, { type: 'body', metatype: RegisterPublicV1Dto });
    } catch (error) {
      throw new Error(`Invalid JSON in body field: ${error.message}`);
    }

    return this.authSerivice.createAccountUserPublicv1(body, files);
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
