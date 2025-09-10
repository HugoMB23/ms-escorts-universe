import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { JwtService } from '../jwt/jwt.service';

@Module({
  controllers: [VideoController],
  providers: [VideoService,JwtService]
})
export class VideoModule {}
