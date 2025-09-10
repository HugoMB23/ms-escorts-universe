import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, Req, UseFilters, UnauthorizedException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CoverService } from './cover.service';
import { ImageValidationInterceptor } from '../../utils/image-validation.interceptor';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtService } from '../../modules/jwt/jwt.service';
import { JwtExceptionFilter } from '../../common/filters/jwt-exception.filter';

@Controller('cover')
@UseFilters(JwtExceptionFilter)
export class CoverController {
  constructor(
    private readonly coverService: CoverService,
    private readonly jwtService: JwtService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'), ImageValidationInterceptor)
  async uploadCover(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const token = req.headers['authorization'].split(' ')[1];
    const { sub: uuid, username: nick, code, message } = this.jwtService.decodeToken(token);
    console.log('code log')
    if (code !== 200) {
      throw new UnauthorizedException(message);
    }
  
    return this.coverService.uploadCover(file, uuid, nick);
  }
}
