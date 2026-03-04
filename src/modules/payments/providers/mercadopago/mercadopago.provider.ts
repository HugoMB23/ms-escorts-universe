import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import axios from 'axios';
import {
  IPaymentProvider,
  CreateCheckoutParams,
  CheckoutResponse,
  PaymentWebhookPayload,
} from '../../interfaces/payment-provider.interface';

@Injectable()
export class MercadoPagoProvider implements IPaymentProvider {
  private readonly mpBase = 'https://api.mercadopago.com';

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResponse> {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    const publicUrl = process.env.APP_PUBLIC_URL;

    if (!accessToken || !publicUrl) {
      throw new InternalServerErrorException(
        'MP_ACCESS_TOKEN or APP_PUBLIC_URL not configured',
      );
    }

    const payload = {
      items: [
        {
          title: params.description || 'Payment',
          quantity: 1,
          unit_price: params.amount,
          currency_id: params.currency,
        },
      ],
      external_reference: params.externalReference,
      notification_url: `${publicUrl}/payments/webhook/mercadopago`,
      back_urls: {
        success: `${publicUrl}/payments/return/success`,
        pending: `${publicUrl}/payments/return/pending`,
        failure: `${publicUrl}/payments/return/failure`,
      },
      auto_return: 'approved',
      metadata: params.metadata,
    };

    try {
      const { data } = await axios.post(
        `${this.mpBase}/checkout/preferences`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        },
      );

      const initPoint = data?.init_point;
      if (!initPoint) {
        throw new InternalServerErrorException(
          'MercadoPago did not return init_point',
        );
      }

      return {
        preferenceId: data.id,
        initPoint,
        metadata: { mpPreferenceId: data.id },
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `MercadoPago error: ${error.response?.data?.message || error.message}`,
        );
      }
      throw error;
    }
  }

  async getPayment(paymentId: string): Promise<any> {
    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
      throw new InternalServerErrorException('MP_ACCESS_TOKEN not configured');
    }

    try {
      const { data } = await axios.get(`${this.mpBase}/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 15000,
      });

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `Failed to get payment from MercadoPago: ${error.message}`,
        );
      }
      throw error;
    }
  }

  validateWebhookSignature(
    payload: PaymentWebhookPayload,
    signature: string,
  ): boolean {
    // TODO: Implement MercadoPago signature validation
    // MercadoPago sends signature in header, implement HMAC validation
    return true; // Temporary
  }

  async extractWebhookPayment(payload: PaymentWebhookPayload): Promise<{
    paymentId: string;
    status: string;
    externalReference: string;
  }> {
    const paymentId = payload.data?.id;
    if (!paymentId) {
      throw new BadRequestException('No payment ID in webhook payload');
    }

    // Get actual payment from MercadoPago (source of truth)
    const payment = await this.getPayment(paymentId);

    return {
      paymentId: payment.id,
      status: payment.status,
      externalReference: payment.external_reference,
    };
  }
}
