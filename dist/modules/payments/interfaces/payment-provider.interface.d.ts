export interface CreateCheckoutParams {
    externalReference: string;
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, any>;
}
export interface CheckoutResponse {
    preferenceId: string;
    initPoint: string;
    metadata?: Record<string, any>;
}
export interface PaymentWebhookPayload {
    [key: string]: any;
}
export interface IPaymentProvider {
    createCheckout(params: CreateCheckoutParams): Promise<CheckoutResponse>;
    getPayment(paymentId: string): Promise<any>;
    validateWebhookSignature(payload: PaymentWebhookPayload, signature: string): boolean;
    extractWebhookPayment(payload: PaymentWebhookPayload): Promise<{
        paymentId: string;
        status: string;
        externalReference: string;
    }>;
}
