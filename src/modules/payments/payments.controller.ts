import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
  Query,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtToken } from '../../common/decorators/jwt-token.decorator';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Create a checkout for a booking/service
   * POST /payments/checkout
   */
  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCheckout(
    @JwtToken() userId: string,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.paymentsService.createCheckout(userId, dto);
  }

  /**
   * Handle MercadoPago webhook
   * POST /payments/webhook/mercadopago
   *
   * MercadoPago sends: type=payment, data.id=<paymentId>
   * Can come as body or query params
   */
  @Post('webhook/mercadopago')
  @HttpCode(HttpStatus.OK)
  async handleMercadoPagoWebhook(
    @Body() body: any,
    @Query() query: any,
    @Headers('x-signature') signature: string,
  ) {
    this.logger.log('🔵 MercadoPago webhook received');

    // Extract paymentId from multiple sources (MP sends different formats)
    const type = (body?.type ?? query?.type ?? '').toString();
    const paymentId =
      body?.data?.id ??
      query?.['data.id'] ??
      body?.id ??
      query?.id;

    if (!paymentId) {
      this.logger.warn('⚠️ Webhook: no paymentId found, ignoring');
      return { ok: true };
    }

    // MP sends type=payment for payment notifications
    if (type && type !== 'payment') {
      this.logger.debug(`ℹ️ Webhook type=${type} is not payment, ignoring`);
      return { ok: true };
    }

    this.logger.log(`🧾 Processing MercadoPago paymentId: ${paymentId}`);

    try {
      const result = await this.paymentsService.handleMercadoPagoWebhook(
        String(paymentId),
        signature,
      );
      this.logger.log(`✅ Webhook processed successfully`);
      return { ok: true, ...result };
    } catch (error) {
      this.logger.error(
        `❌ Webhook error: ${error.message}`,
        error.stack,
      );
      // Return 200 OK anyway - don't let MP retry
      return { ok: true };
    }
  }

  /**
   * Get payment details
   * GET /payments/:paymentId
   */
  @Get(':paymentId')
  @UseGuards(JwtAuthGuard)
  async getPayment(@Param('paymentId') paymentId: string) {
    return this.paymentsService.getPaymentById(paymentId);
  }

  /**
   * Verify payment status with provider (source of truth)
   * GET /payments/:paymentId/verify
   */
  @Get(':paymentId/verify')
  @UseGuards(JwtAuthGuard)
  async verifyPaymentStatus(@Param('paymentId') paymentId: string) {
    return this.paymentsService.verifyPaymentStatus(paymentId);
  }

  /**
   * Generate test payment URL to validate credentials
   * POST /payments/test/generate-url
   * No auth required - only for testing
   */
  @Post('test/generate-url')
  @HttpCode(HttpStatus.CREATED)
  async generateTestPaymentUrl(@Body() body: any) {
    this.logger.log('🧪 TEST: Generating test payment URL');

    const amount = body?.amount ?? 50000;
    const currency = body?.currency ?? 'CLP';
    const description = body?.description ?? 'Test Payment - Validate Credentials';
    const testUserId = randomUUID(); // Generate valid UUID for testing
    const externalReference = testUserId; // Use same UUID as reference

    this.logger.log(
      `💰 Test checkout: ${amount} ${currency} - ${description}`,
    );

    try {
      const result = await this.paymentsService.createCheckout(
        testUserId,
        {
          externalReference,
          amount,
          currency,
          description,
          provider: 'mercadopago',
          metadata: {
            type: 'test',
            timestamp: new Date().toISOString(),
          },
        },
      );

      this.logger.log('✅ TEST: Payment URL generated successfully');

      return {
        ok: true,
        message: 'Test payment URL generated - validate your credentials',
        data: {
          testUserId,
          paymentId: result.paymentId,
          externalReference,
          amount,
          currency,
          paymentUrl: result.initPoint,
          description,
          instructions:
            '1. Copy the paymentUrl\n2. Open it in your browser\n3. Complete the test payment\n4. Check your MercadoPago account\n5. Webhook should process automatically',
        },
      };
    } catch (error) {
      this.logger.error(
        `❌ TEST: Failed to generate payment URL`,
        error.stack,
      );

      return {
        ok: false,
        error: error.message,
        hint: 'Check your MP_ACCESS_TOKEN and APP_PUBLIC_URL environment variables',
        troubleshooting: {
          step1: 'Verify MP_ACCESS_TOKEN is set correctly',
          step2: 'Verify APP_PUBLIC_URL is set correctly',
          step3: 'Check MercadoPago account has API access enabled',
          step4: 'Verify network connectivity to api.mercadopago.com',
        },
      };
    }
  }
}
