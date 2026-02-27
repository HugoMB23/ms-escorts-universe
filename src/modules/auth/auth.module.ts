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
import { ServiceCategoryEntity } from 'src/common/entity/service-category.entity';
import { ServiceCategoryPlanEntity } from 'src/common/entity/service-category-plan.entity';
import { ProfileEntity } from 'src/common/entity/profile.entity';
import { ApiKeyMiddleware } from '../../middlewares/api-key.middleware';
import { MailService } from '../mail/mail.service';
import { RegistrationDocsModule } from '../registration-docs/registration-docs.module';




@Module({
 
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserPlanEntity,
      PlanEntity,
      ServiceCategoryEntity,
      ServiceCategoryPlanEntity,
      ProfileEntity,
    ]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secretUser,
      signOptions: { expiresIn: process.env.TIME_TOKEN_USER ? String(process.env.TIME_TOKEN_USER+'min') : '30min'},
    }),
    ThrottlerModule.forRoot([{
      ttl: 10,
      limit: 2,
    }]),
    RegistrationDocsModule,
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

