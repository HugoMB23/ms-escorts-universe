import { Module } from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';

@Module({

  providers: [JwtService],
  controllers: []
})
export class JwtModule {}
