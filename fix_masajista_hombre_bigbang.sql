-- ============================================================================
-- FIX: Agregar Big Bang para Masajista Hombre
-- ============================================================================
-- Este script asegura que la BD tenga correctamente configurado:
-- 1. La categoría "Masajista Hombre" en service_category
-- 2. Los 3 planes (Nebulosa, Supernova, Big Bang) en plan
-- 3. Las relaciones M:N en service_category_plan
-- ============================================================================

-- PASO 1: Verificar que los 3 planes existen
SELECT 'Verificando planes...' as step;
SELECT id_plan, name FROM plan WHERE name IN ('Nebulosa', 'Supernova', 'Big Bang');

-- PASO 2: Verificar que la categoría "Masajista Hombre" existe
SELECT 'Verificando categorías...' as step;
SELECT id_category, name, slug FROM service_category WHERE name = 'Masajista Hombre';

-- PASO 3: Verificar las relaciones M:N actuales para Masajista Hombre
SELECT 'Relaciones M:N para Masajista Hombre...' as step;
SELECT 
  scp.id_service_category_plan,
  sc.name as category_name,
  p.name as plan_name,
  scp.available
FROM service_category_plan scp
JOIN service_category sc ON scp.id_service_category = sc.id_category
JOIN plan p ON scp.id_plan = p."idPlan"
WHERE sc.name = 'Masajista Hombre'
ORDER BY p.name;

-- PASO 4: Si falta alguna relación, insertarlas
-- Primero obtener IDs necesarios
WITH ids AS (
  SELECT 
    (SELECT id_category FROM service_category WHERE name = 'Masajista Hombre') as category_id,
    array_agg(idPlan) as plan_ids
  FROM plan
  WHERE name IN ('Nebulosa', 'Supernova', 'Big Bang')
)
INSERT INTO service_category_plan (id_service_category, id_plan, available)
SELECT ids.category_id, unnest(ids.plan_ids), TRUE
FROM ids
WHERE ids.category_id IS NOT NULL
ON CONFLICT (id_service_category, id_plan) DO NOTHING;

-- PASO 5: Verificar el resultado final
SELECT 'Verificación final - Todas las categorías con sus planes:' as step;
SELECT 
  sc.name as category_name,
  COUNT(scp.id_service_category_plan) as total_planes,
  string_agg(p.name, ', ' ORDER BY p.name) as planes
FROM service_category sc
LEFT JOIN service_category_plan scp ON sc.id_category = scp.id_service_category
LEFT JOIN plan p ON scp.id_plan = p."idPlan"
GROUP BY sc.id_category, sc.name
ORDER BY sc.id_category;

-- PASO 6: Específicamente para Masajista Hombre
SELECT 'Masajista Hombre - Debe tener 3 planes:' as step;
SELECT 
  p.name as plan_name,
  scp.available as disponible
FROM service_category_plan scp
JOIN service_category sc ON scp.id_service_category = sc.id_category
JOIN plan p ON scp.id_plan = p."idPlan"
WHERE sc.name = 'Masajista Hombre'
ORDER BY 
  CASE 
    WHEN p.name = 'Nebulosa' THEN 1
    WHEN p.name = 'Supernova' THEN 2
    WHEN p.name = 'Big Bang' THEN 3
    ELSE 4
  END;

-- ============================================================================
-- ROLLBACK (si necesitas revertir)
-- ============================================================================
-- DELETE FROM service_category_plan 
-- WHERE id_service_category = (SELECT id_category FROM service_category WHERE name = 'Masajista Hombre')
-- AND id_plan = (SELECT idPlan FROM plan WHERE name = 'Big Bang');
