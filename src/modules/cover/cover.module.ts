import { Module } from '@nestjs/common';
import { CoverService } from './cover.service';
import { CoverController } from './cover.controller';
import { JwtService } from '../jwt/jwt.service';

@Module({
  providers: [CoverService, JwtService],
  controllers: [CoverController]
})
export class CoverModule {}
