import { Module } from '@nestjs/common';
import { PhotosService } from './photo.service';
import { PhotosController } from './photo.controller';
import { JwtService } from '../jwt/jwt.service';

@Module({

  providers: [PhotosService,JwtService],
  controllers: [PhotosController]
})
export class PhotoModule {}
