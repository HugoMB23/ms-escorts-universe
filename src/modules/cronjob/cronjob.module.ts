import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
//import { CronjobService } from './cronjob.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule],
  providers: [
    //CronjobService,
    {
      provide: 'REDIS',
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        const redisOptions = {
          tls: {
            rejectUnauthorized: false, // Puedes ajustar esta configuración según tus necesidades
          },
        };
        return new Redis(redisUrl, redisOptions);
      },
      inject: [ConfigService],
    },
  ],
})
export class CronjobModule {}
