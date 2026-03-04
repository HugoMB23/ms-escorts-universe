# Payments Module Guide

## Overview
The Payments module is a **provider-agnostic payment system** built with NestJS that supports multiple payment providers (MercadoPago, Stripe, etc.) using the **Strategy Pattern**.

### Architecture Benefits
- ✅ Easy to add new payment providers without modifying existing code
- ✅ Single interface for all payment operations
- ✅ Unified webhook handling
- ✅ Provider-agnostic database tracking

---

## Key Concepts

### PaymentEntity
Stores all payment information locally for audit trail and state management.

**Columns:**
- `id` - Internal payment ID (UUID)
- `userUuid` - User who made the payment
- `provider` - Payment provider name ('mercadopago', 'stripe', etc.)
- `amount` - Payment amount
- `currency` - Currency code ('CLP', 'USD', etc.)
- `status` - PENDING, APPROVED, REJECTED, CANCELLED, REFUNDED
- `externalId` - Payment ID from provider (source of truth)
- `externalReference` - Link to internal resource (bookingId, serviceId, etc.)
- `metadata` - Additional data from provider
- `createdAt`, `updatedAt` - Timestamps

### IPaymentProvider Interface
Every payment provider must implement this interface:

```typescript
interface IPaymentProvider {
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResponse>;
  getPayment(paymentId: string): Promise<any>;
  validateWebhookSignature(payload: PaymentWebhookPayload, signature: string): boolean;
  extractWebhookPayment(payload: PaymentWebhookPayload): Promise<...>;
}
```

---

## Usage

### 1. Create a Checkout

**Endpoint:** `POST /payments/checkout`

```bash
curl -X POST http://localhost:3000/payments/checkout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "externalReference": "booking-123",
    "amount": 50000,
    "currency": "CLP",
    "description": "LimpIA - Limpieza estándar",
    "provider": "mercadopago",
    "metadata": {
      "bookingType": "standard",
      "serviceArea": "Santiago"
    }
  }'
```

**Response:**
```json
{
  "paymentId": "uuid-of-local-payment",
  "initPoint": "https://checkout.mercadopago.com/...",
  "externalId": "preference-id-from-mp"
}
```

**What happens:**
1. Local Payment record created (PENDING status)
2. Preference created in MercadoPago
3. Returns redirect URL for user to complete payment

### 2. Handle Webhook

**Endpoint:** `POST /payments/webhook/mercadopago`

The payment provider sends a webhook when payment status changes.

```typescript
// In MercadoPago dashboard:
// Notification URL: https://your-app.com/payments/webhook/mercadopago
```

**What happens:**
1. Webhook signature validated
2. Payment details extracted from provider
3. Local Payment record updated with new status
4. Return 200 OK to acknowledge receipt

### 3. Verify Payment Status

**Endpoint:** `GET /payments/:paymentId/verify`

```bash
curl -X GET http://localhost:3000/payments/uuid-of-payment/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**What happens:**
1. Fetch payment from provider (source of truth)
2. Update local record if status changed
3. Return current payment status

### 4. Get Payment Details

**Endpoint:** `GET /payments/:paymentId`

```bash
curl -X GET http://localhost:3000/payments/uuid-of-payment \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Adding a New Payment Provider

### Step 1: Create Provider Implementation

Create `src/modules/payments/providers/stripe/stripe.provider.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { IPaymentProvider, CreateCheckoutParams, CheckoutResponse } from '../payment-provider.interface';

@Injectable()
export class StripeProvider implements IPaymentProvider {
  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResponse> {
    // Implement Stripe-specific logic
    // Return { preferenceId, initPoint, metadata? }
  }

  async getPayment(paymentId: string): Promise<any> {
    // Fetch payment from Stripe API
  }

  validateWebhookSignature(payload: any, signature: string): boolean {
    // Implement Stripe signature validation
  }

  async extractWebhookPayment(payload: any) {
    // Extract payment details from Stripe webhook
  }
}
```

### Step 2: Update payments.module.ts

```typescript
import { StripeProvider } from './providers/stripe/stripe.provider';

@Module({
  // ...
  providers: [
    PaymentsService,
    {
      provide: 'PAYMENT_PROVIDER',
      useClass: StripeProvider, // Change here
    },
  ],
})
export class PaymentsModule {}
```

### Step 3: (Optional) Dynamic Provider Selection

For supporting multiple providers at runtime:

```typescript
{
  provide: 'PAYMENT_PROVIDER',
  useFactory: () => {
    const provider = process.env.PAYMENT_PROVIDER || 'mercadopago';
    if (provider === 'mercadopago') return new MercadoPagoProvider();
    if (provider === 'stripe') return new StripeProvider();
    throw new Error(`Unknown payment provider: ${provider}`);
  },
}
```

---

## Environment Variables

```env
# Payment Provider
PAYMENT_PROVIDER=mercadopago

# MercadoPago
MP_ACCESS_TOKEN=your_mp_access_token
APP_PUBLIC_URL=https://your-app.com

# Stripe (if using)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Database Migration

Before running the app, apply the migration:

```bash
# Using psql
psql -U postgres -d your_db < migration_create_payment_table.sql

# Or paste the SQL content directly in your DB client
```

---

## Payment Status Flow

```
User Initiates Payment
         ↓
   PENDING (local DB)
         ↓
User Completes Checkout → Provider processes payment
         ↓
Webhook arrives → Status updated in local DB
         ↓
APPROVED / REJECTED / CANCELLED / REFUNDED
```

---

## Error Handling

### Common Errors

**Provider configuration missing:**
```json
{
  "statusCode": 500,
  "message": "MP_ACCESS_TOKEN not configured"
}
```

**Payment not found:**
```json
{
  "statusCode": 404,
  "message": "Payment not found"
}
```

**Invalid webhook:**
```json
{
  "statusCode": 400,
  "message": "No payment ID in webhook payload"
}
```

---

## Testing Webhooks Locally

Use `ngrok` to expose your local server:

```bash
ngrok http 3000
```

Then in MercadoPago dashboard:
- Set Notification URL to: `https://your-ngrok-url.ngrok.io/payments/webhook/mercadopago`
- Process a test payment through the MercadoPago sandbox
- Webhook will be sent to your local server

---

## Best Practices

1. **Always validate webhook signatures** - Prevents replay attacks
2. **Use externalReference for idempotency** - Same booking ID won't create duplicate payments
3. **Fetch from provider for status verification** - Local DB is audit trail, provider is source of truth
4. **Store metadata** - Keep provider-specific data for debugging
5. **Handle duplicate webhooks** - Use idempotency keys and check local record first

---

## Troubleshooting

### Payment shows PENDING but never updates
- Check webhook logs in provider dashboard
- Verify notification URL is accessible
- Ensure webhook signature validation is not rejecting valid requests

### User sees "Payment not found" error
- Verify externalReference is correct
- Check that payment was actually created (see PaymentEntity)
- Look for errors in application logs

### Provider returns 401 Unauthorized
- Check API credentials in environment variables
- Verify token has correct permissions
- Regenerate token if it has expired
