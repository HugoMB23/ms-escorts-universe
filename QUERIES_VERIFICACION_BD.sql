-- ============================================
-- QUERIES PARA VERIFICAR ESTRUCTURA DE BD
-- ============================================
-- Ejecuta estas queries en DBeaver para ver la estructura real

-- 1. Ver estructura de tabla "plan"
\d plan

-- 2. Ver estructura de tabla "service_category"
\d service_category

-- 3. Ver estructura de tabla "service_category_plan"
\d service_category_plan

-- 4. Ver estructura de tabla "user_plan"
\d user_plan

-- ============================================
-- Si las queries arriba no funcionan, intenta estas:
-- ============================================

-- 5. Ver columnas de "plan"
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'plan' 
ORDER BY ordinal_position;

-- 6. Ver columnas de "service_category"
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'service_category' 
ORDER BY ordinal_position;

-- 7. Ver columnas de "service_category_plan"
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'service_category_plan' 
ORDER BY ordinal_position;

-- 8. Ver columnas de "user_plan"
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_plan' 
ORDER BY ordinal_position;
