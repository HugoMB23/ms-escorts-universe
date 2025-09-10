import { Module } from '@nestjs/common';
import { AvatarService } from './avatar.service'
import { AvatarController } from './avatar.controller';
import { JwtService } from '../jwt/jwt.service';

@Module({

  providers: [AvatarService, JwtService],
  controllers: [AvatarController]
})
export class AvatarModule {}


