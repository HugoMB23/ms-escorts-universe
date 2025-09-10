import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisController } from './redis.controller';
import { JwtService } from '../jwt/jwt.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Module({
  imports: [ConfigModule],
  providers: [
    RedisService,
    JwtService,
    {
      provide: 'REDIS',
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');

        const redis = new Redis(redisUrl, {
          tls: redisUrl.startsWith('rediss://') ? {} : undefined,
          maxRetriesPerRequest: 5,
          connectTimeout: 5000,
        });

        redis.on('connect', () => {
          console.log('[ioredis] Connected to Redis');
        });

        redis.on('error', (err) => {
          console.error('[ioredis] Redis error:', err.message);
        });

        return redis;
      },
      inject: [ConfigService],
    },
  ],
  controllers: [RedisController],
  exports: ['REDIS', RedisService],
})
export class RedisModule {}
