import { Controller, Post, Delete, UploadedFiles, Param, UseInterceptors, Body, Patch, UploadedFile, UseGuards, Req, HttpException, HttpStatus, UseFilters, UnauthorizedException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photo.service';
import { UpdatePhotoHighlightedDto } from '../../common/dto/profile-path.dto';
import { ImageValidationInterceptor } from '../../utils/image-validation.interceptor';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtService } from '../../modules/jwt/jwt.service';
import { JwtExceptionFilter } from '../../common/filters/jwt-exception.filter';

@Controller('photos')
@UseFilters(JwtExceptionFilter)
export class PhotosController {
  constructor(private readonly photosService: PhotosService, private readonly jwtService: JwtService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 30), ImageValidationInterceptor)
  async uploadPhotos(@UploadedFiles() files: Express.Multer.File[], @Req() req: Request) {
    const token = req.headers['authorization'].split(' ')[1];
    const { sub: uuid, username: nick, plan, code, message } = this.jwtService.decodeToken(token);

    if (code !== 200) {
      throw new UnauthorizedException(message);
    }

    return this.photosService.uploadPhotos(files, nick, uuid, plan);
  }

  @Patch()
  async updatePhoto(@Body() data: UpdatePhotoHighlightedDto, @Req() req: Request) {
    const token = req.headers['authorization'].split(' ')[1];
    const { sub: uuid, username: nick, plan, code, message } = this.jwtService.decodeToken(token);

    if (code !== 200) {
      throw new UnauthorizedException(message);
    }

    return this.photosService.updatePhotoHighlighted(uuid, nick, plan, data);
  }

  @Delete('delete/:photoUrl')
  async deletePhoto(@Param('photoUrl') photoUrl: string, @Req() req: Request) {
    const token = req.headers['authorization'].split(' ')[1];
    const { sub: uuid, username: nick, code, message } = this.jwtService.decodeToken(token);

    if (code !== 200) {
      throw new UnauthorizedException(message);
    }

    return this.photosService.deletePhoto(photoUrl, uuid, nick);
  }
}
