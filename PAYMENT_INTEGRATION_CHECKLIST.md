# Payment Integration Checklist

## ✅ Completado
- [x] PaymentsModule creado con estrategia genérica
- [x] MercadoPagoProvider implementado
- [x] PaymentEntity y PaymentStatus enum creados
- [x] Webhook handler robusto
- [x] PaymentsService inyectado en AuthService
- [x] createCheckout() integrado en registration flow

---

## ⚠️ PENDIENTE: Ejecutar migración BD

Antes de que el app funcione, debes crear la tabla `payment`:

```bash
# Opción 1: Usar psql directamente
psql -U postgres -d your_database < migration_create_payment_table.sql

# Opción 2: En tu DB client (DBeaver, pgAdmin, etc.)
# Copiar y pegar el contenido de migration_create_payment_table.sql
```

**Ubicación**: `/Users/hugo/Desktop/Backend/Backend/ms-escorts-universe/migration_create_payment_table.sql`

---

## ⚠️ PENDIENTE: Validar variables de entorno

En tu `.env`:

```env
# Pagos - MercadoPago
MP_ACCESS_TOKEN=tu_access_token_aqui
APP_PUBLIC_URL=https://tu-app.com  # o http://localhost:3000 para desarrollo

# Webhook URL en MercadoPago dashboard:
# https://tu-app.com/payments/webhook/mercadopago
```

---

## ⚠️ PENDIENTE: Decidir Plan en Registration

**Problema actual**: El código está hardcodeado con `amount: 20000` (CLP).

**Opciones**:

### Opción A: Plan seleccionable durante registro
```typescript
// Agregar a RegisterPublicV1Dto
selectedPlanId?: number;  // El usuario elige el plan
selectedPlanDays?: '7d' | '15d' | '30d';

// En auth.service.ts, obtener el precio del plan:
const plan = await this.planRepository.findOne({
  where: { idPlan: userPublicData.selectedPlanId }
});
const amount = this.calculatePlanPrice(plan, userPublicData.selectedPlanDays);
```

### Opción B: Plan por defecto gratis
```typescript
// No generar pago en registration, solo crear el usuario
// El usuario elige plan después de loguearse
paymentUrl = null;  // Sin cobro en registro
```

### Opción C: Plan gratis + Optional paid plan upgrade
```typescript
// Crear usuario con plan free
// Ofrecer link de pago opcional para upgrade
if (userPublicData.selectedPlanId) {
  paymentUrl = await this.paymentsService.createCheckout(...);
}
```

---

## ⚠️ PENDIENTE: Vincular PaymentEntity con Plan

**Problema**: El pago actualmente solo se crea, pero no vincula a `user_plan`.

**Solución**: En el webhook, cuando pago es APPROVED:

```typescript
// En handleMercadoPagoWebhook() de payments.service.ts
if (payment.status === PaymentStatus.APPROVED) {
  // TODO: Crear registro en user_plan
  await this.userPlanRepository.save({
    userUuid: payment.userUuid,
    idPlan: extractedFromPaymentMetadata, // Necesitas guardar esto
    startDate: new Date(),
    endDate: addDays(new Date(), durationDays),
  });
}
```

---

## ⚠️ PENDIENTE: Guardar planId en metadata

Actualizar `createCheckout()` en auth.service.ts:

```typescript
const checkoutResponse = await this.paymentsService.createCheckout(
  createdUser.uuid,
  {
    externalReference: createdUser.uuid,
    amount: 20000,
    currency: 'CLP',
    description: 'Registration Plan - 7 days basic',
    provider: 'mercadopago',
    metadata: {
      type: 'registration',
      registrationStep: 'payment',
      planId: selectedPlanId,  // ← AGREGAR ESTO
      planDays: 7,              // ← AGREGAR ESTO
    },
  },
);
```

---

## ⚠️ PENDIENTE: Crear Enum para Plan (opcional)

Para referencia clara:

```typescript
// src/enum/planType.enum.ts
export enum PlanDuration {
  SEVEN_DAYS = 7,
  FIFTEEN_DAYS = 15,
  THIRTY_DAYS = 30,
}
```

---

## ✅ TESTING: Flujo de pago completo

### 1. Registrar usuario
```bash
curl -X POST http://localhost:3000/auth/register-public-v1 \
  -H "Content-Type: application/json" \
  -d '{
    "step2": {
      "email": "test@example.com",
      "password": "Test123!",
      "nickname": "testuser",
      "birthdate": "1990-05-15",
      "nationality": "Chile",
      "hasParking": true,
      "description": "Test"
    },
    "step3": {
      "height": "165",
      "weight": "60",
      "bodyType": "slim"
    }
  }'
```

**Response esperada**:
```json
{
  "data": {
    "user": "uuid-aqui",
    "urlPayment": "https://checkout.mercadopago.com/..."  // ← Link de pago
  },
  "statusCode": 200,
  "message": "User created successfully"
}
```

### 2. User visita `urlPayment` en navegador
- Se abre MercadoPago checkout
- User completa pago
- MercadoPago redirige a `success` URL

### 3. Webhook se ejecuta automáticamente
- MercadoPago envía POST a `/payments/webhook/mercadopago`
- Backend actualiza PaymentEntity status → APPROVED
- TODO: Crear user_plan automáticamente

### 4. User ya puede usar su plan
- Su token JWT incluye el plan
- Puede acceder a features del plan

---

## 🎯 Próximos pasos recomendados:

1. **Inmediato**: Ejecutar migración de tabla payment
2. **Muy pronto**:
   - Validar MP_ACCESS_TOKEN en `.env`
   - Decidir qué plan se asigna en registro
   - Guardar planId en metadata del pago
3. **Soon**:
   - Implementar lógica de crear user_plan al pagar
   - Agregar relación Payment → UserPlan en entities
   - Implementar signature validation de webhooks MP
4. **Eventually**:
   - Refund logic
   - Payment retry logic
   - Admin dashboard para ver pagos

---

## 📚 Referencias útiles:

- [PAYMENTS_GUIDE.md](src/modules/payments/PAYMENTS_GUIDE.md) - Documentación completa
- [INTEGRATION_EXAMPLE.md](src/modules/payments/INTEGRATION_EXAMPLE.md) - Ejemplo con Bookings
- [PaymentsService](src/modules/payments/payments.service.ts) - Métodos disponibles

---

## 💡 Nota importante:

El webhook de MercadoPago es **asincrónico**. Si el user intenta acceder inmediatamente después del pago, podría no tener el plan aún si el webhook no procesó. Soluciones:

- Agregar verificación en login: `GET /payments/:paymentId/verify` sincroniza con MP
- Usar polling en frontend después del pago
- Implementar WebSocket para notificaciones en tiempo real
