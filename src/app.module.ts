import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ProfileModule } from './modules/profile/profile.module';
import { PhotoModule } from './modules/photo/photo.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from './modules/redis/redis.module';
import { JwtModule } from './modules/jwt/jwt.module'
import { HistoryModule } from './modules/history/history.module';
import { CronjobModule } from './modules/cronjob/cronjob.module';
import { VideoModule } from './modules/video/video.module';
import { AvatarService } from './modules/avatar/avatar.service';
import { AvatarModule } from './modules/avatar/avatar.module';
import { CoverModule } from './modules/cover/cover.module';
import { MailModule } from './modules/mail/mail.module';
import { CouponModule } from './modules/coupon/coupon.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  CacheModule.registerAsync({
  imports: [ConfigModule],
  isGlobal: true,
  useFactory: async (config: ConfigService) => {
    const url = config.get<string>('REDIS_URL')!;
    const u = new URL(url);
    const isTls = u.protocol === 'rediss:';

    // LOG útil para validar en runtime
    console.log('[CacheModule] URL:', url, '| TLS?', isTls, '| host:', u.hostname, '| port:', u.port);

    return {
      store: await redisStore({
        url,
        socket: isTls ? { tls: true, servername: u.hostname } : undefined, // <- CLAVE
      }),
      // ttl: 60, // opcional
    };
  },
  inject: [ConfigService],
}),
    AuthModule,
    DatabaseModule,
    ProfileModule,
    PhotoModule,
    RedisModule,
    HistoryModule,
    CronjobModule,
    JwtModule,
    VideoModule,
    AvatarModule,
    CoverModule,
    MailModule,
    CouponModule,
  ],
  controllers: [AppController],
  providers: [AppService, AvatarService],
})
export class AppModule {}
