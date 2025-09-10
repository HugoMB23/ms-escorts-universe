import { Controller, Post, Delete, UploadedFile, Param, UseInterceptors, UseGuards, Req, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtService } from '../../modules/jwt/jwt.service';
import { VideoValidationInterceptor } from '../../utils/video-validation.interceptor';

@Controller('videos')
@UseGuards(JwtAuthGuard)
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'), VideoValidationInterceptor)
  async uploadVideo(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const token = req.headers['authorization'].split(' ')[1];
    const { sub: uuid, username: nick, plan, code, message } = this.jwtService.decodeToken(token);

    if (code !== 200) {
      throw new UnauthorizedException(message);
    }

    return this.videoService.uploadVideo(file, nick, uuid, plan);
  }

  @Delete('delete/:videoUrl')
  async deleteVideo(@Param('videoUrl') videoUrl: string, @Req() req: Request) {
    const token = req.headers['authorization'].split(' ')[1];
    const { sub: uuid, username: nick, code, message } = this.jwtService.decodeToken(token);

    if (code !== 200) {
      throw new UnauthorizedException(message);
    }

    return this.videoService.deleteVideo(videoUrl, uuid, nick);
  }
}
