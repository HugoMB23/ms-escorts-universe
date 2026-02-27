-- ============================================================================
-- MIGRACIÓN: De PlanCategory a ServiceCategory + ServiceCategoryPlan (M:N)
-- ============================================================================
-- Este script migra la estructura de datos de la vieja forma a la nueva
-- donde ServiceCategory es independiente de Plan.
-- ============================================================================

-- PASO 1: Crear tabla service_category (si no existe)
CREATE TABLE IF NOT EXISTS service_category (
  id_category SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

-- PASO 2: Crear tabla service_category_plan (tabla intermedia M:N)
CREATE TABLE IF NOT EXISTS service_category_plan (
  id_service_category_plan SERIAL PRIMARY KEY,
  id_service_category INT NOT NULL,
  id_plan INT NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_service_category) REFERENCES service_category(id_category) ON DELETE CASCADE,
  FOREIGN KEY (id_plan) REFERENCES plan("idPlan") ON DELETE CASCADE,
  UNIQUE(id_service_category, id_plan)
);

-- PASO 3: Insertar categorías de servicio (6 categorías base)
INSERT INTO service_category (name, slug, description) VALUES
('Escort', 'escort', 'Acompañamiento general de escorts'),
('Trans', 'escort-trans', 'Servicios de escorts trans'),
('Fantasía', 'escort-fantasia', 'Servicios de fantasía'),
('Masajista Mujer', 'masajista-mujer', 'Servicios de masaje - Masajistas mujeres'),
('Masajista Hombre', 'masajista-hombre', 'Servicios de masaje - Masajistas hombres'),
('Publicidad', 'publicidad', 'Servicios de publicidad y promoción')
ON CONFLICT (name) DO NOTHING;

-- PASO 4: Obtener los IDs de planes (asumiendo que ya existen 3 planes)
-- Nebulosa (id=1), Supernova (id=2), Big Bang (id=3)
-- Si tus IDs son diferentes, ajusta estos valores

-- PASO 5: Crear relaciones M:N entre categorías y planes
-- Por defecto, todas las categorías están disponibles en todos los planes
INSERT INTO service_category_plan (id_service_category, id_plan, available)
SELECT 
  sc.id_category,
  p."idPlan",
  TRUE
FROM service_category sc
CROSS JOIN plan p
ON CONFLICT (id_service_category, id_plan) DO NOTHING;

-- PASO 6: (OPCIONAL) Si tienes datos específicos en plan_category, migra aquí
-- Ejemplo: Si algunas categorías estaban deshabilitadas en ciertos planes
-- UPDATE service_category_plan 
-- SET available = FALSE 
-- WHERE id_service_category = X AND id_plan = Y;

-- PASO 7: Remover columna idCategory de tabla plan (después de validar)
-- ⚠️ CUIDADO: Ejecuta esto SOLO después de validar que los datos están bien migrados
-- ALTER TABLE plan DROP COLUMN id_category;

-- PASO 8: (OPCIONAL) Backup de datos antiguos antes de eliminar plan_category
-- CREATE TABLE plan_category_backup AS SELECT * FROM plan_category;

-- PASO 9: (OPCIONAL) Eliminar tabla plan_category después de validar migración
-- DROP TABLE plan_category;

-- ============================================================================
-- VERIFICACIÓN: Ejecuta estas queries para validar la migración
-- ============================================================================

-- Ver todas las categorías de servicio
SELECT * FROM service_category;

-- Ver todas las relaciones M:N
SELECT 
  scp.id_service_category_plan,
  sc.name as category_name,
  p.name as plan_name,
  scp.available
FROM service_category_plan scp
JOIN service_category sc ON scp.id_service_category = sc.id_category
JOIN plan p ON scp.id_plan = p."idPlan"
ORDER BY sc.name, p.name;

-- Contar relaciones por plan
SELECT 
  p.name as plan_name,
  COUNT(scp.id_service_category_plan) as total_categories
FROM plan p
LEFT JOIN service_category_plan scp ON p."idPlan" = scp.id_plan
GROUP BY p."idPlan", p.name;

-- ============================================================================
-- ROLLBACK (si algo sale mal)
-- ============================================================================
-- DELETE FROM service_category_plan;
-- DELETE FROM service_category;
-- ALTER TABLE plan ADD COLUMN id_category INT;
-- UPDATE plan SET id_category = (SELECT id_category FROM plan_category WHERE name = 'nombre');
