-- ============================================================================
-- MIGRACIÓN: Agregar campos JSONB a tabla plan
-- ============================================================================
-- Agrega campos para almacenar precios, características, iconos y precios
-- personalizados por región desde la BD
-- ============================================================================

-- PASO 1: Agregar columnas JSONB a tabla plan (si no existen)
ALTER TABLE plan
ADD COLUMN IF NOT EXISTS icon VARCHAR(255),
ADD COLUMN IF NOT EXISTS price_details JSONB,
ADD COLUMN IF NOT EXISTS custom_price JSONB,
ADD COLUMN IF NOT EXISTS features JSONB;

-- PASO 2: Actualizar datos existentes con valores por defecto

-- Actualizar Nebulosa
UPDATE plan SET
  icon = 'plans/plan-diablo-bronce.svg',
  price_details = '[
    {"label": "7 días", "price": "$20.000", "value": "7d"},
    {"label": "15 días", "price": "$30.000", "value": "15d"},
    {"label": "30 días", "price": "$50.000", "value": "30d"}
  ]'::jsonb,
  custom_price = '{
    "Coquimbo": [
      {"label": "7 días", "price": "$2000", "value": "7d"},
      {"label": "15 días", "price": "$90", "value": "15d"},
      {"label": "30 días", "price": "$150", "value": "30d"}
    ]
  }'::jsonb,
  features = '[
    "Fotografía de portada de tamaño pequeño",
    "Listado en 3er grupo de portada y categoría",
    "Publicación de hasta {maxPhoto} fotografías en book",
    "Carga de hasta {maxPhoto} fotos nuevas",
    "Publicación de {maxVideo} video en book",
    "Carga de {maxVideo} video en book",
    "Publicación de {maxHistory} historia al día",
    "Anuncio en promoción hasta por 7 días",
    "Acceso a plataforma de autoservicio 24hrs",
    "Asistencia telefónica en horario de oficina"
  ]'::jsonb
WHERE name = 'Nebulosa';

-- Actualizar Supernova
UPDATE plan SET
  icon = 'plans/plan-diablo-silver.svg',
  price_details = '[
    {"label": "7 días", "price": "$50", "value": "7d"},
    {"label": "15 días", "price": "$90", "value": "15d"},
    {"label": "30 días", "price": "$150", "value": "30d"}
  ]'::jsonb,
  features = '[
    "Fotografía de portada de tamaño mediano",
    "Listado en 2do grupo de portada y categoría",
    "Publicación de hasta {maxPhoto} fotografías en book",
    "Carga de hasta {maxPhoto} fotos nuevas",
    "Publicación de {maxVideo} videos en book",
    "Carga de {maxVideo} videos en book",
    "Publicación de {maxHistory} historias al día",
    "Anuncio en promoción hasta por 15 días",
    "Acceso a plataforma de autoservicio 24hrs",
    "Asistencia telefónica en horario de oficina"
  ]'::jsonb
WHERE name = 'Supernova';

-- Actualizar Big Bang
UPDATE plan SET
  icon = 'plans/plan-diablo-gold.svg',
  price_details = '[
    {"label": "7 días", "price": "$50", "value": "7d"},
    {"label": "15 días", "price": "$90", "value": "15d"},
    {"label": "30 días", "price": "$150", "value": "30d"}
  ]'::jsonb,
  features = '[
    "Fotografía de portada de tamaño grande",
    "Listado en 1er grupo de portada y categoría",
    "Publicación de hasta {maxPhoto} fotografías en book",
    "Carga de hasta {maxPhoto} fotos nuevas",
    "Publicación de {maxVideo} video en book",
    "Carga de {maxVideo} videos en book",
    "Publicación de {maxHistory} historias al día",
    "Anuncio en promoción hasta por 30 días",
    "Acceso a plataforma de autoservicio 24hrs",
    "Asistencia telefónica en horario de oficina"
  ]'::jsonb
WHERE name = 'Big Bang';

-- PASO 3: Verificar que los datos se actualizaron correctamente
SELECT 
  idPlan,
  name,
  icon,
  price_details,
  features,
  custom_price
FROM plan
ORDER BY idPlan;

-- ============================================================================
-- ROLLBACK (si algo sale mal)
-- ============================================================================
-- ALTER TABLE plan
-- DROP COLUMN IF EXISTS icon,
-- DROP COLUMN IF EXISTS price_details,
-- DROP COLUMN IF EXISTS custom_price,
-- DROP COLUMN IF EXISTS features;
