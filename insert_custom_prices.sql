-- ============================================
-- INSERTAR PRECIOS ESPECIALES POR REGIÓN (customPrice)
-- Para Nebulosa, Supernova y Big Bang
-- Comunas: Coquimbo, Valparaíso, Santiago, Concepción, Valdivia
-- ============================================

-- 1. NEBULOSA - Precios especiales por comuna
UPDATE plan 
SET "customPrice" = '{
  "Coquimbo": [
    {"label":"7 días","price":"$15.000","value":"7d"},
    {"label":"15 días","price":"$25.000","value":"15d"},
    {"label":"30 días","price":"$40.000","value":"30d"}
  ],
  "Valparaíso": [
    {"label":"7 días","price":"$18.000","value":"7d"},
    {"label":"15 días","price":"$28.000","value":"15d"},
    {"label":"30 días","price":"$45.000","value":"30d"}
  ],
  "Santiago": [
    {"label":"7 días","price":"$20.000","value":"7d"},
    {"label":"15 días","price":"$30.000","value":"15d"},
    {"label":"30 días","price":"$50.000","value":"30d"}
  ],
  "Concepción": [
    {"label":"7 días","price":"$16.000","value":"7d"},
    {"label":"15 días","price":"$26.000","value":"15d"},
    {"label":"30 días","price":"$42.000","value":"30d"}
  ],
  "Valdivia": [
    {"label":"7 días","price":"$14.000","value":"7d"},
    {"label":"15 días","price":"$24.000","value":"15d"},
    {"label":"30 días","price":"$38.000","value":"30d"}
  ]
}'::jsonb
WHERE "name" = 'nebulosa';

-- 2. SUPERNOVA - Precios especiales por comuna
UPDATE plan 
SET "customPrice" = '{
  "Coquimbo": [
    {"label":"7 días","price":"$40.000","value":"7d"},
    {"label":"15 días","price":"$75.000","value":"15d"},
    {"label":"30 días","price":"$130.000","value":"30d"}
  ],
  "Valparaíso": [
    {"label":"7 días","price":"$45.000","value":"7d"},
    {"label":"15 días","price":"$80.000","value":"15d"},
    {"label":"30 días","price":"$140.000","value":"30d"}
  ],
  "Santiago": [
    {"label":"7 días","price":"$50.000","value":"7d"},
    {"label":"15 días","price":"$90.000","value":"15d"},
    {"label":"30 días","price":"$150.000","value":"30d"}
  ],
  "Concepción": [
    {"label":"7 días","price":"$42.000","value":"7d"},
    {"label":"15 días","price":"$77.000","value":"15d"},
    {"label":"30 días","price":"$135.000","value":"30d"}
  ],
  "Valdivia": [
    {"label":"7 días","price":"$38.000","value":"7d"},
    {"label":"15 días","price":"$70.000","value":"15d"},
    {"label":"30 días","price":"$120.000","value":"30d"}
  ]
}'::jsonb
WHERE "name" = 'supernova';

-- 3. BIG BANG - Precios especiales por comuna
UPDATE plan 
SET "customPrice" = '{
  "Coquimbo": [
    {"label":"7 días","price":"$40.000","value":"7d"},
    {"label":"15 días","price":"$75.000","value":"15d"},
    {"label":"30 días","price":"$130.000","value":"30d"}
  ],
  "Valparaíso": [
    {"label":"7 días","price":"$45.000","value":"7d"},
    {"label":"15 días","price":"$80.000","value":"15d"},
    {"label":"30 días","price":"$140.000","value":"30d"}
  ],
  "Santiago": [
    {"label":"7 días","price":"$50.000","value":"7d"},
    {"label":"15 días","price":"$90.000","value":"15d"},
    {"label":"30 días","price":"$150.000","value":"30d"}
  ],
  "Concepción": [
    {"label":"7 días","price":"$42.000","value":"7d"},
    {"label":"15 días","price":"$77.000","value":"15d"},
    {"label":"30 días","price":"$135.000","value":"30d"}
  ],
  "Valdivia": [
    {"label":"7 días","price":"$38.000","value":"7d"},
    {"label":"15 días","price":"$70.000","value":"15d"},
    {"label":"30 días","price":"$120.000","value":"30d"}
  ]
}'::jsonb
WHERE "name" = 'big-bang';

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT "idPlan", "name", "customPrice" FROM plan;
