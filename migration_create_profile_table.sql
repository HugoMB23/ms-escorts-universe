-- ============================================================================
-- MIGRACIÓN: Crear tabla profile
-- ============================================================================
-- Crea tabla para almacenar información de perfil de usuarios
-- Estructura: Perfiles con datos personales, físicos, servicios y fechas
-- ============================================================================

-- PASO 1: Crear tabla profile con columnas en camelCase (TypeORM)
CREATE TABLE IF NOT EXISTS profile (
  "idProfile" SERIAL PRIMARY KEY,
  "userUuid" UUID NOT NULL UNIQUE,
  "age" INTEGER,
  "description" TEXT,
  "nationality" VARCHAR(100),
  "height" VARCHAR(20),
  "weight" VARCHAR(20),
  "waist" VARCHAR(20),
  "bust" VARCHAR(20),
  "hips" VARCHAR(20),
  "bodyType" VARCHAR(100),
  "depilation" BOOLEAN DEFAULT false,
  "tattoos" BOOLEAN DEFAULT false,
  "piercings" BOOLEAN DEFAULT false,
  "smoker" BOOLEAN DEFAULT false,
  "drinker" BOOLEAN DEFAULT false,
  "languages" VARCHAR(150),
  "eyeColor" VARCHAR(50),
  "hairColor" VARCHAR(50),
  "listService" JSONB,
  "parking" BOOLEAN DEFAULT false,
  "startDate" DATE,
  "endDate" DATE,
  CONSTRAINT "fk_profile_user" FOREIGN KEY ("userUuid") REFERENCES "user"(uuid) ON DELETE CASCADE
);

-- PASO 2: Crear índices para queries frecuentes
CREATE INDEX IF NOT EXISTS "idx_profile_user_uuid" ON profile("userUuid");
CREATE INDEX IF NOT EXISTS "idx_profile_start_date" ON profile("startDate" DESC);
CREATE INDEX IF NOT EXISTS "idx_profile_end_date" ON profile("endDate" DESC);

-- PASO 3: Verificar que la tabla fue creada correctamente
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profile'
ORDER BY ordinal_position;

-- ============================================================================
-- ROLLBACK (si algo sale mal, ejecutar):
-- ============================================================================
-- DROP TABLE IF EXISTS profile CASCADE;
