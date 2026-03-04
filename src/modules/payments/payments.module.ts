import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentEntity } from '../../common/entity/payment.entity';
import { PlanEntity } from '../../common/entity/plan.entity';
import { UserPlanEntity } from '../../common/entity/userPlan.entity';
import { MercadoPagoProvider } from './providers/mercadopago/mercadopago.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity, PlanEntity, UserPlanEntity]),
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    {
      provide: 'PAYMENT_PROVIDER',
      useClass: MercadoPagoProvider,
    },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
