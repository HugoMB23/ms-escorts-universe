"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("../../common/entity/payment.entity");
const paymentStatus_enum_1 = require("../../enum/paymentStatus.enum");
const plan_entity_1 = require("../../common/entity/plan.entity");
const userPlan_entity_1 = require("../../common/entity/userPlan.entity");
const luxon_1 = require("luxon");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(paymentRepository, planRepository, userPlanRepository, paymentProvider) {
        this.paymentRepository = paymentRepository;
        this.planRepository = planRepository;
        this.userPlanRepository = userPlanRepository;
        this.paymentProvider = paymentProvider;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    async calculatePaymentAmount(planName, planDays) {
        this.logger.log(`💰 Calculating amount for plan: ${planName}, days: ${planDays}`);
        const planKey = planName.includes('-')
            ? planName.split('-').pop().toLowerCase()
            : planName.toLowerCase();
        this.logger.log(`🔎 Looking for plan with name: ${planKey}`);
        const plan = await this.planRepository.findOne({
            where: { name: planKey },
        });
        if (!plan) {
            throw new common_1.NotFoundException(`Plan not found: ${planKey}. Make sure plan exists in database.`);
        }
        this.logger.log(`✅ Found plan: ${plan.name} (id: ${plan.idPlan})`);
        const priceDetails = plan.priceDetails;
        if (!priceDetails || priceDetails.length === 0) {
            throw new common_1.BadRequestException(`Plan ${plan.name} has no priceDetails configured in database`);
        }
        const priceDetail = priceDetails.find((p) => parseInt(p.value) === planDays || p.value === `${planDays}d`);
        if (!priceDetail) {
            throw new common_1.BadRequestException(`Plan ${plan.name} does not support ${planDays} days. Available: ${priceDetails
                .map((p) => p.value)
                .join(', ')}`);
        }
        const priceString = priceDetail.price.replace(/\D/g, '');
        const amount = parseInt(priceString);
        this.logger.log(`✅ Calculated amount: ${amount} CLP for ${planDays}d plan`);
        return { amount, plan };
    }
    async createCheckout(userId, dto) {
        this.logger.log(`🔵 Creating checkout for user ${userId}, externalReference: ${dto.externalReference}`);
        const payment = this.paymentRepository.create({
            userUuid: userId,
            provider: dto.provider || 'mercadopago',
            amount: dto.amount,
            currency: dto.currency,
            externalReference: dto.externalReference,
            status: paymentStatus_enum_1.PaymentStatus.PENDING,
            metadata: dto.metadata,
        });
        const savedPayment = await this.paymentRepository.save(payment);
        this.logger.log(`✅ Payment created in DB: ${savedPayment.id}`);
        this.logger.log(`📤 Calling provider to create checkout...`);
        const checkoutResponse = await this.paymentProvider.createCheckout({
            externalReference: dto.externalReference,
            amount: dto.amount,
            currency: dto.currency,
            description: dto.description,
            metadata: { paymentId: savedPayment.id },
        });
        savedPayment.externalId = checkoutResponse.preferenceId;
        await this.paymentRepository.save(savedPayment);
        this.logger.log(`✅ Checkout created. initPoint: ${checkoutResponse.initPoint}`);
        return {
            paymentId: savedPayment.id,
            initPoint: checkoutResponse.initPoint,
            externalId: checkoutResponse.preferenceId,
        };
    }
    async handleMercadoPagoWebhook(paymentId, _signature) {
        this.logger.log(`🧾 Handling MercadoPago webhook for paymentId: ${paymentId}`);
        try {
            this.logger.log(`📥 Fetching payment from provider...`);
            const providerPayment = await this.paymentProvider.getPayment(paymentId);
            this.logger.log(`✅ Payment fetched from provider - Status: ${providerPayment.status}`);
            const externalReference = providerPayment.external_reference;
            if (!externalReference) {
                this.logger.warn(`⚠️ Payment ${paymentId} has no external_reference, ignoring`);
                return { acknowledged: true };
            }
            const payment = await this.paymentRepository.findOne({
                where: { externalReference },
            });
            if (!payment) {
                this.logger.warn(`⚠️ Payment not found for externalReference: ${externalReference}, ignoring`);
                return { acknowledged: true };
            }
            const oldStatus = payment.status;
            const statusMap = {
                approved: paymentStatus_enum_1.PaymentStatus.PROCESSED,
                pending: paymentStatus_enum_1.PaymentStatus.PENDING,
                rejected: paymentStatus_enum_1.PaymentStatus.REJECTED,
                cancelled: paymentStatus_enum_1.PaymentStatus.CANCELLED,
                refunded: paymentStatus_enum_1.PaymentStatus.REFUNDED,
            };
            payment.status = statusMap[providerPayment.status] || payment.status;
            payment.externalId = paymentId;
            payment.metadata = {
                ...payment.metadata,
                lastWebhookStatus: providerPayment.status,
                lastWebhookAt: new Date().toISOString(),
                providerPaymentData: providerPayment,
            };
            await this.paymentRepository.save(payment);
            if (oldStatus !== payment.status) {
                this.logger.log(`🎉 Payment status updated: ${oldStatus} → ${payment.status}`);
                if (payment.status === paymentStatus_enum_1.PaymentStatus.PROCESSED) {
                    try {
                        await this.createUserPlanFromPayment(payment);
                    }
                    catch (error) {
                        this.logger.error(`❌ Failed to create user_plan: ${error.message}`, error.stack);
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
        }
        catch (error) {
            this.logger.error(`❌ Error processing webhook: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getPaymentById(paymentId) {
        const payment = await this.paymentRepository.findOne({
            where: { id: paymentId },
            relations: ['user'],
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        return payment;
    }
    async getPaymentByExternalReference(externalReference) {
        const payment = await this.paymentRepository.findOne({
            where: { externalReference },
            relations: ['user'],
        });
        return payment;
    }
    async verifyPaymentStatus(paymentId) {
        this.logger.log(`🔍 Verifying payment status for: ${paymentId}`);
        const payment = await this.getPaymentById(paymentId);
        if (!payment.externalId) {
            throw new common_1.BadRequestException('Payment has no external ID');
        }
        this.logger.log(`📥 Fetching payment from provider (externalId: ${payment.externalId})...`);
        const providerPayment = await this.paymentProvider.getPayment(payment.externalId);
        const statusMap = {
            approved: paymentStatus_enum_1.PaymentStatus.PROCESSED,
            pending: paymentStatus_enum_1.PaymentStatus.PENDING,
            rejected: paymentStatus_enum_1.PaymentStatus.REJECTED,
            cancelled: paymentStatus_enum_1.PaymentStatus.CANCELLED,
            refunded: paymentStatus_enum_1.PaymentStatus.REFUNDED,
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
    async createUserPlanFromPayment(payment) {
        this.logger.log(`🔍 Creating user_plan for payment: ${payment.id}`);
        const planName = payment.metadata?.planName;
        const planDays = payment.metadata?.planDays;
        if (!planName || !planDays) {
            this.logger.warn(`⚠️ Payment missing planName or planDays in metadata, skipping user_plan creation`);
            return;
        }
        const planKey = planName.includes('-')
            ? planName.split('-').pop().toLowerCase()
            : planName.toLowerCase();
        this.logger.log(`🔎 Looking for plan with name: ${planKey}`);
        const plan = await this.planRepository.findOne({
            where: { name: planKey },
        });
        if (!plan) {
            throw new common_1.BadRequestException(`Plan not found: ${planKey}. Available plans: ${planName}`);
        }
        this.logger.log(`✅ Found plan: ${plan.name} (id: ${plan.idPlan})`);
        const priceDetails = plan.priceDetails;
        if (!priceDetails || priceDetails.length === 0) {
            throw new common_1.BadRequestException(`Plan ${plan.name} has no priceDetails configured`);
        }
        const priceDetail = priceDetails.find((p) => parseInt(p.value) === planDays || p.value === `${planDays}d`);
        if (!priceDetail) {
            throw new common_1.BadRequestException(`Plan ${plan.name} does not support ${planDays} days duration`);
        }
        const priceString = priceDetail.price.replace(/\D/g, '');
        const expectedPrice = parseInt(priceString);
        this.logger.log(`💰 Expected price: ${expectedPrice}, Paid amount: ${payment.amount}`);
        if (payment.amount !== expectedPrice) {
            throw new common_1.BadRequestException(`Amount mismatch. Expected: ${expectedPrice}, Received: ${payment.amount}`);
        }
        const startDate = luxon_1.DateTime.now()
            .setZone('America/Santiago')
            .toFormat('yyyy-MM-dd');
        const endDate = luxon_1.DateTime.now()
            .setZone('America/Santiago')
            .plus({ days: planDays })
            .toFormat('yyyy-MM-dd');
        this.logger.log(`📅 Creating user_plan: ${payment.userUuid} → ${plan.name} (${planDays}d) [${startDate} to ${endDate}]`);
        const existingPlan = await this.userPlanRepository.findOne({
            where: { userUuid: payment.userUuid, idPlan: plan.idPlan },
        });
        if (existingPlan) {
            this.logger.log(`📌 Updating existing user_plan (id: ${existingPlan.idUserPlan})`);
            existingPlan.startDate = startDate;
            existingPlan.endDate = endDate;
            await this.userPlanRepository.save(existingPlan);
        }
        else {
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.PaymentEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(plan_entity_1.PlanEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(userPlan_entity_1.UserPlanEntity)),
    __param(3, (0, common_1.Inject)('PAYMENT_PROVIDER')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map