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
var PaymentsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const payments_service_1 = require("./payments.service");
const create_checkout_dto_1 = require("./dto/create-checkout.dto");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const jwt_token_decorator_1 = require("../../common/decorators/jwt-token.decorator");
let PaymentsController = PaymentsController_1 = class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
        this.logger = new common_1.Logger(PaymentsController_1.name);
    }
    async createCheckout(userId, dto) {
        return this.paymentsService.createCheckout(userId, dto);
    }
    async handleMercadoPagoWebhook(body, query, signature) {
        this.logger.log('🔵 MercadoPago webhook received');
        const type = (body?.type ?? query?.type ?? '').toString();
        const paymentId = body?.data?.id ??
            query?.['data.id'] ??
            body?.id ??
            query?.id;
        if (!paymentId) {
            this.logger.warn('⚠️ Webhook: no paymentId found, ignoring');
            return { ok: true };
        }
        if (type && type !== 'payment') {
            this.logger.debug(`ℹ️ Webhook type=${type} is not payment, ignoring`);
            return { ok: true };
        }
        this.logger.log(`🧾 Processing MercadoPago paymentId: ${paymentId}`);
        try {
            const result = await this.paymentsService.handleMercadoPagoWebhook(String(paymentId), signature);
            this.logger.log(`✅ Webhook processed successfully`);
            return { ok: true, ...result };
        }
        catch (error) {
            this.logger.error(`❌ Webhook error: ${error.message}`, error.stack);
            return { ok: true };
        }
    }
    async getPayment(paymentId) {
        return this.paymentsService.getPaymentById(paymentId);
    }
    async verifyPaymentStatus(paymentId) {
        return this.paymentsService.verifyPaymentStatus(paymentId);
    }
    async handlePaymentSuccess(query) {
        this.logger.log('✅ Payment success redirect received', query);
        return {
            ok: true,
            message: 'Payment completed successfully',
            preferenceId: query.preference_id,
            paymentId: query.payment_id,
            externalReference: query.external_reference,
        };
    }
    async handlePaymentPending(query) {
        this.logger.log('⏳ Payment pending redirect received', query);
        return {
            ok: true,
            message: 'Payment is pending',
            preferenceId: query.preference_id,
            paymentId: query.payment_id,
            externalReference: query.external_reference,
        };
    }
    async handlePaymentFailure(query) {
        this.logger.log('❌ Payment failure redirect received', query);
        return {
            ok: false,
            message: 'Payment failed or was rejected',
            preferenceId: query.preference_id,
            paymentId: query.payment_id,
            externalReference: query.external_reference,
        };
    }
    async generateTestPaymentUrl(body) {
        this.logger.log('🧪 TEST: Generating test payment URL');
        const amount = body?.amount ?? 50000;
        const currency = body?.currency ?? 'CLP';
        const description = body?.description ?? 'Test Payment - Validate Credentials';
        const testUserId = (0, crypto_1.randomUUID)();
        const externalReference = testUserId;
        this.logger.log(`💰 Test checkout: ${amount} ${currency} - ${description}`);
        try {
            const result = await this.paymentsService.createCheckout(testUserId, {
                externalReference,
                amount,
                currency,
                description,
                provider: 'mercadopago',
                metadata: {
                    type: 'test',
                    timestamp: new Date().toISOString(),
                },
            });
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
                    instructions: '1. Copy the paymentUrl\n2. Open it in your browser\n3. Complete the test payment\n4. Check your MercadoPago account\n5. Webhook should process automatically',
                },
            };
        }
        catch (error) {
            this.logger.error(`❌ TEST: Failed to generate payment URL`, error.stack);
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
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('checkout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, jwt_token_decorator_1.JwtToken)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_checkout_dto_1.CreateCheckoutDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createCheckout", null);
__decorate([
    (0, common_1.Post)('webhook/mercadopago'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Headers)('x-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleMercadoPagoWebhook", null);
__decorate([
    (0, common_1.Get)(':paymentId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPayment", null);
__decorate([
    (0, common_1.Get)(':paymentId/verify'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyPaymentStatus", null);
__decorate([
    (0, common_1.Get)('mercadopago/return/success'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handlePaymentSuccess", null);
__decorate([
    (0, common_1.Get)('mercadopago/return/pending'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handlePaymentPending", null);
__decorate([
    (0, common_1.Get)('mercadopago/return/failure'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handlePaymentFailure", null);
__decorate([
    (0, common_1.Post)('test/generate-url'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "generateTestPaymentUrl", null);
exports.PaymentsController = PaymentsController = PaymentsController_1 = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map