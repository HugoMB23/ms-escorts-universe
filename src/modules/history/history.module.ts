import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { JwtService } from '../jwt/jwt.service';

@Module({
  providers: [HistoryService,JwtService],
  controllers: [HistoryController]
})
export class HistoryModule {}