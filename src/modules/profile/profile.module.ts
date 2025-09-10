import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileEntity } from '../../common/entity/profile.entity';
import { ApiKeyMiddleware } from '../../middlewares/api-key.middleware';
import { UserEntity } from 'src/common/entity/user.entity';
import { UserPlanEntity } from 'src/common/entity/userPlan.entity';
import { RedisModule } from '../redis/redis.module'; // ✅ Importar módulo correctamente
import { JwtService } from '../jwt/jwt.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfileEntity,
      UserEntity,
      UserPlanEntity,
    ]),
    RedisModule, // ✅ Importas el módulo que expone RedisService y 'REDIS'
  ],
  controllers: [ProfileController],
  providers: [ProfileService, JwtService], // ⛔️ RedisService YA VIENE desde RedisModule
})
export class ProfileModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes('profile/register');
  }
}
