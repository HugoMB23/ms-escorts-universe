export interface CreateCheckoutParams {
  externalReference: string; // bookingId, etc.
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface CheckoutResponse {
  preferenceId: string;
  initPoint: string; // redirect URL for payment
  metadata?: Record<string, any>;
}

export interface PaymentWebhookPayload {
  [key: string]: any;
}

export interface IPaymentProvider {
  /**
   * Create a checkout/preference and return redirect URL
   */
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResponse>;

  /**
   * Get payment details from provider (source of truth)
   */
  getPayment(paymentId: string): Promise<any>;

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload: PaymentWebhookPayload, signature: string): boolean;

  /**
   * Extract payment details from webhook payload
   */
  extractWebhookPayment(payload: PaymentWebhookPayload): Promise<{
    paymentId: string;
    status: string;
    externalReference: string;
  }>;
}
