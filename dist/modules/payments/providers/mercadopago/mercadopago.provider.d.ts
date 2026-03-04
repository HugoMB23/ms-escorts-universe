import { IPaymentProvider, CreateCheckoutParams, CheckoutResponse, PaymentWebhookPayload } from '../../interfaces/payment-provider.interface';
export declare class MercadoPagoProvider implements IPaymentProvider {
    private readonly mpBase;
    createCheckout(params: CreateCheckoutParams): Promise<CheckoutResponse>;
    getPayment(paymentId: string): Promise<any>;
    validateWebhookSignature(payload: PaymentWebhookPayload, signature: string): boolean;
    extractWebhookPayment(payload: PaymentWebhookPayload): Promise<{
        paymentId: string;
        status: string;
        externalReference: string;
    }>;
}
