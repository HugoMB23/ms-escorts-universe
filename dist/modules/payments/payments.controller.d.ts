import { PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly logger;
    constructor(paymentsService: PaymentsService);
    createCheckout(userId: string, dto: CreateCheckoutDto): Promise<{
        paymentId: string;
        initPoint: string;
        externalId: string;
    }>;
    handleMercadoPagoWebhook(body: any, query: any, signature: string): Promise<{
        ok: boolean;
    } | {
        acknowledged: boolean;
        paymentId?: undefined;
        externalReference?: undefined;
        status?: undefined;
        transactionDate?: undefined;
        ok: boolean;
    } | {
        acknowledged: boolean;
        paymentId: string;
        externalReference: string;
        status: import("../../enum/paymentStatus.enum").PaymentStatus;
        transactionDate: any;
        ok: boolean;
    }>;
    getPayment(paymentId: string): Promise<import("../../common/entity/payment.entity").PaymentEntity>;
    verifyPaymentStatus(paymentId: string): Promise<{
        paymentId: string;
        status: import("../../enum/paymentStatus.enum").PaymentStatus;
        externalReference: string;
        amount: number;
        currency: string;
    }>;
    handlePaymentSuccess(query: any): Promise<{
        ok: boolean;
        message: string;
        preferenceId: any;
        paymentId: any;
        externalReference: any;
    }>;
    handlePaymentPending(query: any): Promise<{
        ok: boolean;
        message: string;
        preferenceId: any;
        paymentId: any;
        externalReference: any;
    }>;
    handlePaymentFailure(query: any): Promise<{
        ok: boolean;
        message: string;
        preferenceId: any;
        paymentId: any;
        externalReference: any;
    }>;
    generateTestPaymentUrl(body: any): Promise<{
        ok: boolean;
        message: string;
        data: {
            testUserId: `${string}-${string}-${string}-${string}-${string}`;
            paymentId: string;
            externalReference: `${string}-${string}-${string}-${string}-${string}`;
            amount: any;
            currency: any;
            paymentUrl: string;
            description: any;
            instructions: string;
        };
        error?: undefined;
        hint?: undefined;
        troubleshooting?: undefined;
    } | {
        ok: boolean;
        error: any;
        hint: string;
        troubleshooting: {
            step1: string;
            step2: string;
            step3: string;
            step4: string;
        };
        message?: undefined;
        data?: undefined;
    }>;
}
