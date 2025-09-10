import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../common/entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../../utils/constants';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { JwtStrategy } from '../../guards/jwt.strategy';
import { UserPlanEntity } from '../../common/entity/userPlan.entity';
import { PlanEntity } from 'src/common/entity/plan.entity';
import { PlanCategoryEntity } from 'src/common/entity/planCategory.entity';
import { ProfileEntity } from 'src/common/entity/profile.entity';
import { ApiKeyMiddleware } from '../../middlewares/api-key.middleware';
import { MailService } from '../mail/mail.service';


@Module({
 
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserPlanEntity,
      PlanEntity,
      PlanCategoryEntity,
      ProfileEntity
      
    ]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secretUser,
      signOptions: { expiresIn: '30m' },
    }),
    ThrottlerModule.forRoot([{
      ttl: 10,
      limit: 2,
    }]),
  ],
  controllers: [AuthController],
  providers: [AuthService,MailService,{
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  },JwtStrategy],
})


export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyMiddleware)
      .forRoutes('auth/register');
  }
}

