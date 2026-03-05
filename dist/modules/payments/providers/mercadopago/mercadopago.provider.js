"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadoPagoProvider = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let MercadoPagoProvider = class MercadoPagoProvider {
    constructor() {
        this.mpBase = 'https://api.mercadopago.com';
    }
    async createCheckout(params) {
        const accessToken = process.env.MP_ACCESS_TOKEN;
        const publicUrl = process.env.APP_PUBLIC_URL;
        if (!accessToken || !publicUrl) {
            throw new common_1.InternalServerErrorException('MP_ACCESS_TOKEN or APP_PUBLIC_URL not configured');
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
                success: `${publicUrl}/payments/mercadopago/return/success`,
                pending: `${publicUrl}/payments/mercadopago/return/pending`,
                failure: `${publicUrl}/payments/mercadopago/return/failure`,
            },
            auto_return: 'approved',
            metadata: params.metadata,
        };
        try {
            const { data } = await axios_1.default.post(`${this.mpBase}/checkout/preferences`, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                timeout: 15000,
            });
            const initPoint = data?.init_point;
            if (!initPoint) {
                throw new common_1.InternalServerErrorException('MercadoPago did not return init_point');
            }
            return {
                preferenceId: data.id,
                initPoint,
                metadata: { mpPreferenceId: data.id },
            };
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new common_1.BadRequestException(`MercadoPago error: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
    async getPayment(paymentId) {
        const accessToken = process.env.MP_ACCESS_TOKEN;
        if (!accessToken) {
            throw new common_1.InternalServerErrorException('MP_ACCESS_TOKEN not configured');
        }
        try {
            const { data } = await axios_1.default.get(`${this.mpBase}/v1/payments/${paymentId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                timeout: 15000,
            });
            return data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new common_1.BadRequestException(`Failed to get payment from MercadoPago: ${error.message}`);
            }
            throw error;
        }
    }
    validateWebhookSignature(payload, signature) {
        return true;
    }
    async extractWebhookPayment(payload) {
        const paymentId = payload.data?.id;
        if (!paymentId) {
            throw new common_1.BadRequestException('No payment ID in webhook payload');
        }
        const payment = await this.getPayment(paymentId);
        return {
            paymentId: payment.id,
            status: payment.status,
            externalReference: payment.external_reference,
        };
    }
};
exports.MercadoPagoProvider = MercadoPagoProvider;
exports.MercadoPagoProvider = MercadoPagoProvider = __decorate([
    (0, common_1.Injectable)()
], MercadoPagoProvider);
//# sourceMappingURL=mercadopago.provider.js.map