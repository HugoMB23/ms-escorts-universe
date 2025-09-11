import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule, RedisModule],
  providers: [],
})
export class CronjobModule {}