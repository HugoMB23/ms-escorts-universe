import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../../common/entity/payment.entity';
import { PaymentStatus } from '../../enum/paymentStatus.enum';
import { IPaymentProvider } from './interfaces/payment-provider.interface';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { PlanEntity } from '../../common/entity/plan.entity';
import { UserPlanEntity } from '../../common/entity/userPlan.entity';
import { DateTime } from 'luxon';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(PlanEntity)
    private readonly planRepository: Repository<PlanEntity>,
    @InjectRepository(UserPlanEntity)
    private readonly userPlanRepository: Repository<UserPlanEntity>,
    @Inject('PAYMENT_PROVIDER')
    private readonly paymentProvider: IPaymentProvider,
  ) {}

  /**
   * Calculate payment amount from plan name and days
   * Searches plan in DB and extracts price from priceDetails
   */
  async calculatePaymentAmount(
    planName: string,
    planDays: number,
  ): Promise<{ amount: number; plan: PlanEntity }> {
    this.logger.log(
      `💰 Calculating amount for plan: ${planName}, days: ${planDays}`,
    );

    // Extract plan name from format "escort-supernova" → "supernova"
    const planKey = planName.includes('-')
      ? planName.split('-').pop().toLowerCase()
      : planName.toLowerCase();

    this.logger.log(`🔎 Looking for plan with name: ${planKey}`);

    // Find plan by name
    const plan = await this.planRepository.findOne({
      where: { name: planKey },
    });

    if (!plan) {
      throw new NotFoundException(
        `Plan not found: ${planKey}. Make sure plan exists in database.`,
      );
    }

    this.logger.log(`✅ Found plan: ${plan.name} (id: ${plan.idPlan})`);

    // Validate priceDetails exists
    const priceDetails = plan.priceDetails as any[];
    if (!priceDetails || priceDetails.length === 0) {
      throw new BadRequestException(
        `Plan ${plan.name} has no priceDetails configured in database`,
      );
    }

    // Find price for the requested duration
    const priceDetail = priceDetails.find(
      (p) => parseInt(p.value) === planDays || p.value === `${planDays}d`,
    );

    if (!priceDetail) {
      throw new BadRequestException(
        `Plan ${plan.name} does not support ${planDays} days. Available: ${priceDetails
          .map((p) => p.value)
          .join(', ')}`,
      );
    }

    // Parse price from string format "$50.000" → 50000
    const priceString = (priceDetail.price as string).replace(/\D/g, '');
    const amount = parseInt(priceString);

    this.logger.log(
      `✅ Calculated amount: ${amount} CLP for ${planDays}d plan`,
    );

    return { amount, plan };
  }

  /**
   * Create a checkout preference and return payment link
   */
  async createCheckout(userId: string, dto: CreateCheckoutDto) {
    this.logger.log(
      `🔵 Creating checkout for user ${userId}, externalReference: ${dto.externalReference}`,
    );

    // Create payment record in DB (PENDING status)
    const payment = this.paymentRepository.create({
      userUuid: userId,
      provider: dto.provider || 'mercadopago',
      amount: dto.amount,
      currency: dto.currency,
      externalReference: dto.externalReference,
      status: PaymentStatus.PENDING,
      metadata: dto.metadata,
    });

    const savedPayment = await this.paymentRepository.save(payment);
    this.logger.log(`✅ Payment created in DB: ${savedPayment.id}`);

    // Call provider to create checkout
    this.logger.log(`📤 Calling provider to create checkout...`);
    const checkoutResponse = await this.paymentProvider.createCheckout({
      externalReference: dto.externalReference,
      amount: dto.amount,
      currency: dto.currency,
      description: dto.description,
      metadata: { paymentId: savedPayment.id },
    });

    // Store external ID from provider
    savedPayment.externalId = checkoutResponse.preferenceId;
    await this.paymentRepository.save(savedPayment);

    this.logger.log(
      `✅ Checkout created. initPoint: ${checkoutResponse.initPoint}`,
    );

    return {
      paymentId: savedPayment.id,
      initPoint: checkoutResponse.initPoint,
      externalId: checkoutResponse.preferenceId,
    };
  }

  /**
   * Handle MercadoPago webhook - fetch payment from provider and update local record
   */
  async handleMercadoPagoWebhook(paymentId: string, _signature?: string) {
    this.logger.log(`🧾 Handling MercadoPago webhook for paymentId: ${paymentId}`);

    // TODO: Validate signature according to MercadoPago docs
    // if (_signature) {
    //   const isValid = this.paymentProvider.validateWebhookSignature({}, _signature);
    //   if (!isValid) {
    //     this.logger.warn('⚠️ Invalid webhook signature');
    //     throw new BadRequestException('Invalid webhook signature');
    //   }
    // }

    try {
      // Get payment from provider (source of truth)
      this.logger.log(`📥 Fetching payment from provider...`);
      const providerPayment = await this.paymentProvider.getPayment(paymentId);
      this.logger.log(
        `✅ Payment fetched from provider - Status: ${providerPayment.status}`,
      );

      const externalReference = providerPayment.external_reference;
      if (!externalReference) {
        this.logger.warn(
          `⚠️ Payment ${paymentId} has no external_reference, ignoring`,
        );
        return { acknowledged: true };
      }

      // Find local payment record by external reference
      const payment = await this.paymentRepository.findOne({
        where: { externalReference },
      });

      if (!payment) {
        this.logger.warn(
          `⚠️ Payment not found for externalReference: ${externalReference}, ignoring`,
        );
        return { acknowledged: true };
      }

      // Update payment status based on provider status
      const oldStatus = payment.status;
      const statusMap = {
        approved: PaymentStatus.PROCESSED,
        pending: PaymentStatus.PENDING,
        rejected: PaymentStatus.REJECTED,
        cancelled: PaymentStatus.CANCELLED,
        refunded: PaymentStatus.REFUNDED,
      };

      payment.status = statusMap[providerPayment.status] || payment.status;
      payment.externalId = paymentId; // Store provider payment ID
      payment.metadata = {
        ...payment.metadata,
        lastWebhookStatus: providerPayment.status,
        lastWebhookAt: new Date().toISOString(),
        providerPaymentData: providerPayment, // Store full response
      };

      await this.paymentRepository.save(payment);

      if (oldStatus !== payment.status) {
        this.logger.log(
          `🎉 Payment status updated: ${oldStatus} → ${payment.status}`,
        );

        // If payment is PROCESSED, create user_plan
        if (payment.status === PaymentStatus.PROCESSED) {
          try {
            await this.createUserPlanFromPayment(payment);
          } catch (error) {
            this.logger.error(
              `❌ Failed to create user_plan: ${error.message}`,
              error.stack,
            );
            // Don't fail the webhook - user_plan can be created manually
          }
        }
      }

      return {
        acknowledged: true,
        paymentId: payment.id,
        externalReference: payment.externalReference,
        status: payment.status,
        transactionDate: providerPayment.date_created,
      };
    } catch (error) {
      this.logger.error(
        `❌ Error processing webhook: ${error.message}`,
        error.stack,
      );
      // Don't re-throw - return 200 OK to avoid MP retrying
      throw error;
    }
  }

  /**
   * Get payment by ID (internal)
   */
  async getPaymentById(paymentId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  /**
   * Get payment by external reference (booking, service, etc.)
   */
  async getPaymentByExternalReference(externalReference: string) {
    const payment = await this.paymentRepository.findOne({
      where: { externalReference },
      relations: ['user'],
    });

    return payment;
  }

  /**
   * Verify payment status with provider (source of truth)
   */
  async verifyPaymentStatus(paymentId: string) {
    this.logger.log(`🔍 Verifying payment status for: ${paymentId}`);

    const payment = await this.getPaymentById(paymentId);

    if (!payment.externalId) {
      throw new BadRequestException('Payment has no external ID');
    }

    // Get actual status from provider
    this.logger.log(
      `📥 Fetching payment from provider (externalId: ${payment.externalId})...`,
    );
    const providerPayment = await this.paymentProvider.getPayment(
      payment.externalId,
    );

    // Update local record if status changed
    const statusMap = {
      approved: PaymentStatus.PROCESSED,
      pending: PaymentStatus.PENDING,
      rejected: PaymentStatus.REJECTED,
      cancelled: PaymentStatus.CANCELLED,
      refunded: PaymentStatus.REFUNDED,
    };

    const newStatus = statusMap[providerPayment.status] || payment.status;
    if (newStatus !== payment.status) {
      this.logger.log(`✅ Status synced: ${payment.status} → ${newStatus}`);
      payment.status = newStatus;
      await this.paymentRepository.save(payment);
    }

    return {
      paymentId: payment.id,
      status: payment.status,
      externalReference: payment.externalReference,
      amount: payment.amount,
      currency: payment.currency,
    };
  }

  /**
   * Create user_plan from approved payment
   * Extracts plan name from metadata and creates the user_plan record
   */
  private async createUserPlanFromPayment(payment: PaymentEntity) {
    this.logger.log(
      `🔍 Creating user_plan for payment: ${payment.id}`,
    );

    // Extract plan info from metadata
    const planName = payment.metadata?.planName;
    const planDays = payment.metadata?.planDays;

    if (!planName || !planDays) {
      this.logger.warn(
        `⚠️ Payment missing planName or planDays in metadata, skipping user_plan creation`,
      );
      return;
    }

    // Extract plan name from format "escort-supernova" → "supernova"
    const planKey = planName.includes('-')
      ? planName.split('-').pop().toLowerCase()
      : planName.toLowerCase();

    this.logger.log(`🔎 Looking for plan with name: ${planKey}`);

    // Find plan by name
    const plan = await this.planRepository.findOne({
      where: { name: planKey },
    });

    if (!plan) {
      throw new BadRequestException(
        `Plan not found: ${planKey}. Available plans: ${planName}`,
      );
    }

    this.logger.log(`✅ Found plan: ${plan.name} (id: ${plan.idPlan})`);

    // Validate price from priceDetails
    const priceDetails = plan.priceDetails as any[];
    if (!priceDetails || priceDetails.length === 0) {
      throw new BadRequestException(
        `Plan ${plan.name} has no priceDetails configured`,
      );
    }

    // Find price for the requested duration
    const priceDetail = priceDetails.find(
      (p) => parseInt(p.value) === planDays || p.value === `${planDays}d`,
    );

    if (!priceDetail) {
      throw new BadRequestException(
        `Plan ${plan.name} does not support ${planDays} days duration`,
      );
    }

    // Parse price from string format "$50.000" → 50000
    const priceString = (priceDetail.price as string).replace(/\D/g, '');
    const expectedPrice = parseInt(priceString);

    this.logger.log(
      `💰 Expected price: ${expectedPrice}, Paid amount: ${payment.amount}`,
    );

    // Validate amount matches
    if (payment.amount !== expectedPrice) {
      throw new BadRequestException(
        `Amount mismatch. Expected: ${expectedPrice}, Received: ${payment.amount}`,
      );
    }

    // Calculate end date
    const startDate = DateTime.now()
      .setZone('America/Santiago')
      .toFormat('yyyy-MM-dd');

    const endDate = DateTime.now()
      .setZone('America/Santiago')
      .plus({ days: planDays })
      .toFormat('yyyy-MM-dd');

    this.logger.log(
      `📅 Creating user_plan: ${payment.userUuid} → ${plan.name} (${planDays}d) [${startDate} to ${endDate}]`,
    );

    // Check if user already has an active plan for this plan_id
    const existingPlan = await this.userPlanRepository.findOne({
      where: { userUuid: payment.userUuid, idPlan: plan.idPlan },
    });

    if (existingPlan) {
      this.logger.log(
        `📌 Updating existing user_plan (id: ${existingPlan.idUserPlan})`,
      );
      existingPlan.startDate = startDate;
      existingPlan.endDate = endDate;
      await this.userPlanRepository.save(existingPlan);
    } else {
      // Create new user_plan
      const userPlan = this.userPlanRepository.create({
        userUuid: payment.userUuid,
        idPlan: plan.idPlan,
        startDate,
        endDate,
      });

      await this.userPlanRepository.save(userPlan);
      this.logger.log(`✅ User plan created successfully`);
    }
  }
}
