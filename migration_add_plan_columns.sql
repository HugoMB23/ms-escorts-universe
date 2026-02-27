-- ============================================
-- MIGRACIÓN: Agregar columnas a tabla "plan"
-- ============================================
-- Este script agrega las columnas: icon, priceDetails, customPrice, features
-- Y popula datos por defecto para los 3 planes existentes

-- 1. Agregar columnas si no existen
ALTER TABLE plan
ADD COLUMN IF NOT EXISTS icon VARCHAR(255),
ADD COLUMN IF NOT EXISTS priceDetails JSONB,
ADD COLUMN IF NOT EXISTS customPrice JSONB,
ADD COLUMN IF NOT EXISTS features JSONB;

-- 2. Actualizar ICON para cada plan
UPDATE plan SET icon = 'plans/plan-diablo-bronce.svg' WHERE name = 'Nebulosa';
UPDATE plan SET icon = 'plans/plan-diablo-silver.svg' WHERE name = 'Supernova';
UPDATE plan SET icon = 'plans/plan-diablo-gold.svg' WHERE name = 'Big Bang';

-- 3. Actualizar PRICEDETAILS (array de precios por duración)
-- Nebulosa: $20.000 (7d), $30.000 (15d), $50.000 (30d)
UPDATE plan 
SET priceDetails = '[
  {"label":"7 días","price":"$20.000","value":"7d"},
  {"label":"15 días","price":"$30.000","value":"15d"},
  {"label":"30 días","price":"$50.000","value":"30d"}
]'::jsonb
WHERE name = 'Nebulosa';

-- Supernova: $50 (7d), $90 (15d), $150 (30d)
UPDATE plan 
SET priceDetails = '[
  {"label":"7 días","price":"$50","value":"7d"},
  {"label":"15 días","price":"$90","value":"15d"},
  {"label":"30 días","price":"$150","value":"30d"}
]'::jsonb
WHERE name = 'Supernova';

-- Big Bang: $50 (7d), $90 (15d), $150 (30d)
UPDATE plan 
SET priceDetails = '[
  {"label":"7 días","price":"$50","value":"7d"},
  {"label":"15 días","price":"$90","value":"15d"},
  {"label":"30 días","price":"$150","value":"30d"}
]'::jsonb
WHERE name = 'Big Bang';

-- 4. Actualizar FEATURES (características con placeholders)
-- Nebulosa: 4 fotos, 1 video, 1 historia
UPDATE plan 
SET features = '[
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

-- Supernova: 3 fotos, 2 videos, 2 historias
UPDATE plan 
SET features = '[
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

-- Big Bang: 18 fotos, 3 videos, 3 historias
UPDATE plan 
SET features = '[
  "Fotografía de portada de tamaño grande",
  "Listado en 1er grupo de portada y categoría",
  "Publicación de hasta {maxPhoto} fotografías en book",
  "Carga de hasta {maxPhoto} fotos nuevas",
  "Publicación de {maxVideo} videos en book",
  "Carga de {maxVideo} videos en book",
  "Publicación de {maxHistory} historias al día",
  "Anuncio en promoción hasta por 30 días",
  "Acceso a plataforma de autoservicio 24hrs",
  "Asistencia telefónica en horario de oficina"
]'::jsonb
WHERE name = 'Big Bang';

-- 5. (OPCIONAL) Agregar customPrice para una región de ejemplo (Coquimbo)
-- Si quieres precios especiales en una región específica, descomentar:
/*
UPDATE plan 
SET customPrice = '{
  "Coquimbo": [
    {"label":"7 días","price":"$15.000","value":"7d"},
    {"label":"15 días","price":"$25.000","value":"15d"},
    {"label":"30 días","price":"$40.000","value":"30d"}
  ]
}'::jsonb
WHERE name = 'Nebulosa';
*/

-- 6. Verificación de datos insertados
SELECT idPlan, name, icon, priceDetails, features FROM plan;

-- Si necesitas ver el customPrice también:
-- SELECT idPlan, name, icon, priceDetails, customPrice, features FROM plan;
