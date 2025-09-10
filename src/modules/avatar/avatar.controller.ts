import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, Req, UseFilters, UnauthorizedException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AvatarService } from './avatar.service';
import { ImageValidationInterceptor } from '../../utils/image-validation.interceptor';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtService } from '../../modules/jwt/jwt.service';
import { JwtExceptionFilter } from '../../common/filters/jwt-exception.filter';

@Controller('avatar')
@UseFilters(JwtExceptionFilter)
export class AvatarController {
  constructor(
    private readonly avatarService: AvatarService,
    private readonly jwtService: JwtService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'), ImageValidationInterceptor)
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const token = req.headers['authorization'].split(' ')[1];
    const { sub: uuid, username: nick, code, message } = this.jwtService.decodeToken(token);

    if (code !== 200) {
      throw new UnauthorizedException(message);
    }

    return this.avatarService.uploadAvatar(file, uuid, nick);
  }
}
