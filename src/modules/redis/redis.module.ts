import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisController } from './redis.controller';
import { JwtService } from '../jwt/jwt.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansConfigEntity } from '../../common/entity/plans.config.entity';
import { PlanEntity } from '../../common/entity/plan.entity';
import { ServiceCategoryEntity } from '../../common/entity/service-category.entity';
import { ServiceCategoryPlanEntity } from '../../common/entity/service-category-plan.entity';

@Module({
  imports: [ConfigModule,
     TypeOrmModule.forFeature([
          PlansConfigEntity,
          PlanEntity,
          ServiceCategoryEntity,
          ServiceCategoryPlanEntity
        ]),
  ],
  providers: [
    RedisService,
    JwtService,
    {
      provide: 'REDIS',
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('REDIS_URL')!;
        const u = new URL(url);
        const isTls = u.protocol === 'rediss:';

        console.log('[ioredis] URL:', url, '| TLS?', isTls, '| host:', u.hostname, '| port:', u.port);

        const client = new Redis(url, isTls ? {
          tls: { servername: u.hostname }, // SNI correcto
          maxRetriesPerRequest: 5,
          connectTimeout: 5000,
        } : {
          // SIN TLS
          maxRetriesPerRequest: 5,
          connectTimeout: 5000,
        });

        client.on('connect', () => console.log('[ioredis] Connected to Redis'));
        client.on('error', (e) => console.error('[ioredis] Redis error:', e?.message));
        return client;
      },
      inject: [ConfigService],
    },
  ],
  controllers: [RedisController],
  exports: ['REDIS', RedisService],
})
export class RedisModule {}
