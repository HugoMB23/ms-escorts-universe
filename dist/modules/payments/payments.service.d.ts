import { Repository } from 'typeorm';
import { PaymentEntity } from '../../common/entity/payment.entity';
import { PaymentStatus } from '../../enum/paymentStatus.enum';
import { IPaymentProvider } from './interfaces/payment-provider.interface';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { PlanEntity } from '../../common/entity/plan.entity';
import { UserPlanEntity } from '../../common/entity/userPlan.entity';
export declare class PaymentsService {
    private readonly paymentRepository;
    private readonly planRepository;
    private readonly userPlanRepository;
    private readonly paymentProvider;
    private readonly logger;
    constructor(paymentRepository: Repository<PaymentEntity>, planRepository: Repository<PlanEntity>, userPlanRepository: Repository<UserPlanEntity>, paymentProvider: IPaymentProvider);
    calculatePaymentAmount(planName: string, planDays: number): Promise<{
        amount: number;
        plan: PlanEntity;
    }>;
    createCheckout(userId: string, dto: CreateCheckoutDto): Promise<{
        paymentId: string;
        initPoint: string;
        externalId: string;
    }>;
    handleMercadoPagoWebhook(paymentId: string, _signature?: string): Promise<{
        acknowledged: boolean;
        paymentId?: undefined;
        externalReference?: undefined;
        status?: undefined;
        transactionDate?: undefined;
    } | {
        acknowledged: boolean;
        paymentId: string;
        externalReference: string;
        status: PaymentStatus;
        transactionDate: any;
    }>;
    getPaymentById(paymentId: string): Promise<PaymentEntity>;
    getPaymentByExternalReference(externalReference: string): Promise<PaymentEntity>;
    verifyPaymentStatus(paymentId: string): Promise<{
        paymentId: string;
        status: PaymentStatus;
        externalReference: string;
        amount: number;
        currency: string;
    }>;
    private createUserPlanFromPayment;
}
