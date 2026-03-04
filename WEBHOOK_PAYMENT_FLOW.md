# Flujo Completo: Registro + Pago + user_plan

## 📋 Resumen del Flujo

```
1. Frontend envía registro con planName y planDays
        ↓
2. Backend crea usuario + profile
        ↓
3. Backend extrae plan_name y days del paso 3
        ↓
4. Backend busca plan en tabla plan por nombre
        ↓
5. Backend valida precio en priceDetails[JSONB]
        ↓
6. Backend crea Payment (PENDING) + initPoint en MP
        ↓
7. Frontend redirige a initPoint (MercadoPago checkout)
        ↓
8. User completa pago en MercadoPago
        ↓
9. MercadoPago envía webhook a backend
        ↓
10. Backend obtiene pago de MP (source of truth)
        ↓
11. Backend actualiza Payment status → APPROVED
        ↓
12. Backend crea user_plan automáticamente
        ↓
13. User obtiene plan activado
```

---

## 🎯 Frontend: Qué debe enviar

Actualizar el POST a `/auth/register-public-v1` para incluir:

```json
{
  "step2": {
    "email": "user@example.com",
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
    "bodyType": "slim",
    "selectedPlanName": "escort-supernova",  // ← NUEVO
    "selectedPlanDays": 7,                   // ← NUEVO (7, 15, o 30)
    "selectedAmount": 50000                  // ← NUEVO (monto a cobrar en CLP)
  }
}
```

### Valores disponibles para `selectedPlanName`:
- `escort-supernova` → plan name en DB: "supernova"
- `escort-nebulosa` → plan name en DB: "nebulosa"
- `escort-bigbang` → plan name en DB: "bigbang"

### Valores válidos para `selectedPlanDays`:
- `7`
- `15`
- `30`

### Cálculo de `selectedAmount`:
Buscar en tabla `plan.priceDetails` (JSONB):
```json
[
  { "label": "7 días", "price": "$50.000", "value": "7d" },
  { "label": "15 días", "price": "$90.000", "value": "15d" },
  { "label": "30 días", "price": "$150.000", "value": "30d" }
]
```

Enviar solo el número sin símbolo de moneda: `50000` (no `"$50.000"`)

---

## 🔧 Backend: Qué sucede internamente

### 1. CreateCheckoutDto recibe (en auth.service.ts):
```typescript
{
  externalReference: "user-uuid",
  amount: 50000,
  currency: "CLP",
  description: "Registration Plan - escort-supernova",
  provider: "mercadopago",
  planName: "escort-supernova",          // ← NUEVO
  planDays: 7,                            // ← NUEVO
  metadata: {
    type: "registration",
    registrationStep: "payment",
    planName: "escort-supernova",
    planDays: 7,
  }
}
```

### 2. PaymentsService.createCheckout():
- Crea `PaymentEntity` en DB (status: PENDING)
- Llama a MercadoPagoProvider para crear preferencia
- Retorna `{ paymentId, initPoint, externalId }`
- Frontend redirige al user a `initPoint`

### 3. User completa pago en MercadoPago

### 4. MercadoPago webhook llega a `/payments/webhook/mercadopago`:
```
POST /payments/webhook/mercadopago
{
  "type": "payment",
  "data": {
    "id": "mercadopago-payment-123"
  }
}
```

### 5. PaymentsController.handleMercadoPagoWebhook():
- Extrae `paymentId` de body/query
- Valida que sea type="payment"
- Llama a `PaymentsService.handleMercadoPagoWebhook(paymentId)`

### 6. PaymentsService.handleMercadoPagoWebhook():
- Obtiene pago real de MercadoPago (source of truth)
- Busca PaymentEntity por `externalReference` (user UUID)
- Actualiza status → APPROVED
- **NUEVO**: Llama a `createUserPlanFromPayment()`

### 7. PaymentsService.createUserPlanFromPayment():
```
1. Extrae planName y planDays de payment.metadata
2. Busca plan en DB: name = "supernova" (sin "escort-")
3. Valida priceDetails en plan.priceDetails[JSONB]
4. Encuentra precio para días solicitados
5. Valida que amount pagado coincida con priceDetails
6. Calcula: startDate = hoy, endDate = hoy + planDays
7. Crea UserPlanEntity:
   {
     userUuid: payment.userUuid,
     idPlan: plan.idPlan,
     startDate: "2025-03-03",
     endDate: "2025-03-10"
   }
8. Si ya existe user_plan para ese plan, actualiza endDate
```

---

## ✅ Validaciones

### En `createUserPlanFromPayment()`:
1. ✅ Plan existe en tabla `plan`
2. ✅ Plan tiene `priceDetails` configurados
3. ✅ Plan soporta duración solicitada (7, 15, o 30 días)
4. ✅ Monto pagado coincide con `priceDetails`
5. ✅ Plan name se extrae correctamente (remove "escort-")

### Errores posibles:
```
❌ "Plan not found: supernova"
   → Verificar nombre en tabla plan

❌ "Plan supernova has no priceDetails configured"
   → Ejecutar migración para agregar priceDetails a plan

❌ "Plan supernova does not support 7 days duration"
   → priceDetails no tiene entrada para "7d" o "value": 7

❌ "Amount mismatch. Expected: 50000, Received: 49900"
   → Frontend envió monto incorrecto
```

---

## 📊 Estructura en Base de Datos

### Tabla `plan`:
```
idPlan | name      | priceDetails (JSONB)
-------|-----------|--------------------
1      | supernova | [{"value":"7d",...}, ...]
2      | nebulosa  | [{"value":"7d",...}, ...]
3      | bigbang   | [{"value":"7d",...}, ...]
```

### Tabla `payment`:
```
id (uuid) | userUuid | externalId | status   | metadata (JSONB)
----------|----------|------------|----------|--------------------
xxx       | user-uuid| mp-pay-123 | APPROVED | {planName, planDays}
```

### Tabla `user_plan`:
```
idUserPlan | userUuid | idPlan | startDate  | endDate
-----------|----------|--------|------------|----------
1          | user-uuid| 1      | 2025-03-03 | 2025-03-10
```

---

## 🔍 Logging del Webhook

Cuando el webhook se procesa, verás logs como:

```
🔵 MercadoPago webhook received
🧾 Processing MercadoPago paymentId: 1234567890
📥 Fetching payment from provider...
✅ Payment fetched from provider - Status: approved
🎉 Payment status updated: PENDING → APPROVED
🔍 Creating user_plan for payment: payment-uuid
🔎 Looking for plan with name: supernova
✅ Found plan: supernova (id: 1)
💰 Expected price: 50000, Paid amount: 50000
📅 Creating user_plan: user-uuid → supernova (7d) [2025-03-03 to 2025-03-10]
✅ User plan created successfully
✅ Webhook processed successfully
```

---

## 🚀 Testing completo

### 1. Registro sin plan (default):
```bash
curl -X POST http://localhost:3000/auth/register-public-v1 \
  -H "Content-Type: application/json" \
  -d '{
    "step2": {...},
    "step3": {
      "height": "165"
      # Sin selectedPlanName/Days/Amount
      # → Usa default: supernova 7d $50,000
    }
  }'
```

### 2. Registro con plan específico:
```bash
curl -X POST http://localhost:3000/auth/register-public-v1 \
  -H "Content-Type: application/json" \
  -d '{
    "step2": {...},
    "step3": {
      "height": "165",
      "selectedPlanName": "escort-bigbang",
      "selectedPlanDays": 30,
      "selectedAmount": 150000
    }
  }'
```

### 3. Response con URL de pago:
```json
{
  "data": {
    "user": "user-uuid-aqui",
    "urlPayment": "https://checkout.mercadopago.com/..."
  },
  "statusCode": 200,
  "message": "User created successfully"
}
```

### 4. User completa pago en MercadoPago

### 5. Webhook se procesa automáticamente
- Payment status actualizado a APPROVED
- user_plan creado en BD
- User ya tiene plan activo

### 6. Verificar user_plan fue creado:
```sql
SELECT * FROM user_plan WHERE userUuid = 'user-uuid-aqui';
-- Deberías ver un registro con endDate = hoy + 30 días
```

---

## 💾 Requisitos antes de usar

1. **Migración de tabla payment ejecutada**:
   ```bash
   psql -U postgres -d your_db < migration_create_payment_table.sql
   ```

2. **Tabla plan con priceDetails** (JSONB):
   ```sql
   -- Ya debe estar en BD según migración anterior
   UPDATE plan SET priceDetails = '[
     {"label": "7 días", "price": "$50.000", "value": "7d"},
     {"label": "15 días", "price": "$90.000", "value": "15d"},
     {"label": "30 días", "price": "$150.000", "value": "30d"}
   ]'::jsonb WHERE name = 'supernova';
   -- Repetir para 'nebulosa', 'bigbang', etc.
   ```

3. **Variables de entorno**:
   ```env
   MP_ACCESS_TOKEN=your_token
   APP_PUBLIC_URL=https://your-domain.com
   ```

---

## 🐛 Troubleshooting

### "Plan not found: supernova"
- Verificar que tabla `plan` tiene registro con `name = 'supernova'`
- Verificar que nombre en DB no tiene "escort-" prefix

### "Plan supernova has no priceDetails configured"
- Ejecutar migración `migration_add_plan_details.sql`
- O actualizar plan con UPDATE query

### Webhook no se procesa
- Verificar que MercadoPago tiene correcta Notification URL configurada
- Usar ngrok para testing local: `ngrok http 3000`
- Verificar logs en backend

### user_plan no fue creado
- Revisar logs del webhook para errores
- El error es logged pero webhook retorna 200 OK (para no hacer retry)
- Puedes crear user_plan manualmente si falla

### "Amount mismatch"
- Frontend está enviando `selectedAmount` incorrecto
- Verificar que extrae bien el precio de `priceDetails` en tabla `plan`
- Verificar que envía número sin símbolo monetario (50000, no "$50.000")

---

## 📝 TODO para el usuario

- [ ] Ejecutar migración de tabla `payment`
- [ ] Actualizar `RegisterPublicV1Dto` para incluir `selectedPlanName`, `selectedPlanDays`, `selectedAmount`
- [ ] Actualizar frontend para solicitar plan al usuario
- [ ] Validar que tabla `plan` tiene `priceDetails` configurados
- [ ] Testear flujo completo: registro → pago → webhook → user_plan
- [ ] Implementar retry logic si webhook falla
- [ ] Implementar signature validation de MercadoPago
