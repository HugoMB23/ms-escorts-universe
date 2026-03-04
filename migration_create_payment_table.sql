-- ============================================================================
-- MIGRACIÓN: Crear tabla payment
-- ============================================================================
-- Crea tabla para almacenar pagos de todos los proveedores
-- Estructura: Trackeador completo de pagos con estados y manejo de errores
-- ============================================================================

-- PASO 1: Crear enum para estados de pago
CREATE TYPE payment_status AS ENUM (
  'PENDING',     -- Esperando confirmación de pago
  'PROCESSED',   -- Pago confirmado y procesado
  'REJECTED',    -- Pago rechazado
  'ERROR',       -- Error durante el procesamiento
  'CANCELLED',   -- Pago cancelado
  'REFUNDED'     -- Pago reembolsado
);

-- PASO 2: Crear tabla payment
CREATE TABLE IF NOT EXISTS payment (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userUuid" UUID NOT NULL,
  "provider" VARCHAR(100) NOT NULL,
  "amount" DECIMAL(10, 2) NOT NULL,
  "currency" VARCHAR(10) NOT NULL,
  "status" payment_status NOT NULL DEFAULT 'PENDING',
  "externalId" VARCHAR(255),
  "externalReference" VARCHAR(255),
  "metadata" JSONB,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "fk_payment_user" FOREIGN KEY ("userUuid") REFERENCES "user"(uuid) ON DELETE CASCADE
);

-- PASO 3: Crear índices para queries frecuentes
CREATE INDEX IF NOT EXISTS "idx_payment_user_uuid" ON payment("userUuid");
CREATE INDEX IF NOT EXISTS "idx_payment_external_id" ON payment("externalId");
CREATE INDEX IF NOT EXISTS "idx_payment_external_reference" ON payment("externalReference");
CREATE INDEX IF NOT EXISTS "idx_payment_status" ON payment("status");
CREATE INDEX IF NOT EXISTS "idx_payment_provider" ON payment("provider");
CREATE INDEX IF NOT EXISTS "idx_payment_created_at" ON payment("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_payment_status_created" ON payment("status", "createdAt" DESC);

-- PASO 4: Verificar que la tabla fue creada correctamente
SELECT
  ordinal_position AS "Posición",
  column_name AS "Columna",
  data_type AS "Tipo",
  is_nullable AS "Nullable",
  column_default AS "Default"
FROM information_schema.columns
WHERE table_name = 'payment'
ORDER BY ordinal_position;

-- Verificar enum creado
SELECT * FROM pg_enum WHERE typname = 'payment_status';

-- Verificar índices creados
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'payment';

-- ============================================================================
-- ROLLBACK (si algo sale mal, ejecutar en este orden):
-- ============================================================================
-- DROP TABLE IF EXISTS payment CASCADE;
-- DROP TYPE IF EXISTS payment_status;
