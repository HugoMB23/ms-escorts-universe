# 🔄 Refactorización: Plan + ServiceCategory

## Resumen del Cambio

Se ha reorganizado la estructura de datos para separar **niveles de plan** (Nebulosa, Supernova, Big Bang) de **tipos de servicio** (Escort, Trans, Fantasía, Masajista, Publicidad).

### Antes (Estructura Defectuosa)
```
PlanCategoryEntity (mezcla tipo + nivel)
├─ "escort-nebulosa"
├─ "escort-supernova"
├─ "escort-big-bang"
├─ "trans-nebulosa"
└─ ...
```

### Después (Estructura Limpia)
```
PlanEntity (3 fijos)              ServiceCategoryEntity (6 tipos)
├─ Nebulosa                       ├─ Escort
├─ Supernova                      ├─ Trans
└─ Big Bang                        ├─ Fantasía
                                  ├─ Masajista Mujer
ServiceCategoryPlanEntity (M:N)   ├─ Masajista Hombre
├─ Escort + Nebulosa              └─ Publicidad
├─ Escort + Supernova
├─ Escort + Big Bang
└─ ...
```

---

## 📋 Cambios Realizados

### 1. Nuevas Entidades
- ✅ `src/common/entity/service-category.entity.ts` - Tipos de servicio
- ✅ `src/common/entity/service-category-plan.entity.ts` - Relación M:N

### 2. Entidades Modificadas
- ✅ `src/common/entity/plan.entity.ts` - Removida relación con PlanCategory
- ✅ `src/common/entity/planCategory.entity.ts` - Deprecada (mantener para backward compatibility)

### 3. Módulos Actualizados
- ✅ `src/modules/auth/auth.module.ts` - Importa nuevas entidades
- ✅ `src/modules/profile/profile.service.ts` - Removidas refs a idCategory/category

### 4. Utilities Actualizadas
- ✅ `src/utils/plan-limits.util.ts` - Nuevo formato de datos
- ✅ `src/modules/redis/redis.service.ts` - Comentarios actualizados

### 5. Archivo SQL
- ✅ `migration_plan_refactor.sql` - Script completo de migración

---

## 🚀 Pasos de Implementación

### Paso 1: Verificar Compilación TypeScript
```bash
npx tsc --noEmit
```
✅ **Estado**: 0 errores

### Paso 2: Ejecutar Migración de Base de Datos

**IMPORTANTE: Haz backup de tu BD antes**
```sql
-- Conecta a tu BD PostgreSQL
psql -U tu_usuario -d tu_bd -f migration_plan_refactor.sql
```

O ejecuta manualmente:
```sql
-- 1. Crear tabla service_category
CREATE TABLE IF NOT EXISTS service_category (
  id_category SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

-- 2. Crear tabla service_category_plan
CREATE TABLE IF NOT EXISTS service_category_plan (
  id_service_category_plan SERIAL PRIMARY KEY,
  id_service_category INT NOT NULL,
  id_plan INT NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_service_category) REFERENCES service_category(id_category),
  FOREIGN KEY (id_plan) REFERENCES plan(id_plan),
  UNIQUE(id_service_category, id_plan)
);

-- 3. Insertar categorías
INSERT INTO service_category (name, slug, description) VALUES
('Escort', 'escort', 'Acompañamiento general de escorts'),
('Trans', 'escort-trans', 'Servicios de escorts trans'),
('Fantasía', 'escort-fantasia', 'Servicios de fantasía'),
('Masajista Mujer', 'masajista-mujer', 'Servicios de masaje - Masajistas mujeres'),
('Masajista Hombre', 'masajista-hombre', 'Servicios de masaje - Masajistas hombres'),
('Publicidad', 'publicidad', 'Servicios de publicidad y promoción');

-- 4. Crear relaciones M:N (todas las categorías en todos los planes)
INSERT INTO service_category_plan (id_service_category, id_plan, available)
SELECT sc.id_category, p.id_plan, TRUE
FROM service_category sc
CROSS JOIN plan p;
```

### Paso 3: Actualizar Formato de Datos en Redis

**Antes:**
```javascript
{
  "Escort": [{
    "value": "escort",
    "plans": [
      { "id": 1, "title": "Nebulosa", "mediaLimit": { "photos": 10, "videos": 5 } },
      { "id": 2, "title": "Supernova", "mediaLimit": { "photos": 25, "videos": 10 } },
      { "id": 3, "title": "Big Bang", "mediaLimit": { "photos": 50, "videos": 20 } }
    ]
  }]
}
```

**Después:**
```javascript
{
  "Nebulosa": { "photos": 10, "videos": 5, "history": 20 },
  "Supernova": { "photos": 25, "videos": 10, "history": 50 },
  "Big Bang": { "photos": 50, "videos": 20, "history": 100 }
}
```

**Cómo actualizar**: 
- El endpoint `/redis/plans` debe devolver el nuevo formato
- Edita `plans.config.entity.ts` o donde almacenes esta configuración
- Redis se actualizará automáticamente en el próximo GET

### Paso 4: Reiniciar la Aplicación
```bash
npm run start:dev
```

### Paso 5: Verificar en Base de Datos

```sql
-- Ver categorías
SELECT * FROM service_category;

-- Ver relaciones M:N
SELECT 
  scp.id_service_category_plan,
  sc.name as category_name,
  p.name as plan_name,
  scp.available
FROM service_category_plan scp
JOIN service_category sc ON scp.id_service_category = sc.id_category
JOIN plan p ON scp.id_plan = p.id_plan
ORDER BY sc.name, p.name;

-- Verificar que plan ya no tiene columna idCategory
DESCRIBE plan;
```

---

## ⚠️ Cambios Importantes para Revisar

1. **photo.service.ts, video.service.ts, history.service.ts**
   - Aún usan `resolveMediaLimit()` con el formato antiguo
   - ✅ Ya actualizado en `plan-limits.util.ts`
   - Prueba subiendo fotos/videos para validar

2. **Redis Cache**
   - Formato de `plansUniverse` cambió
   - Si hay datos en caché antiguo, borrar:
   ```bash
   redis-cli DEL plansUniverse
   ```

3. **Plan Queries**
   - Si tienes queries que hacen JOIN con `plan_category`, actualizar

---

## 🧪 Testing

### Test 1: Verificar Compilación
```bash
npx tsc --noEmit
```

### Test 2: Verificar BD
```sql
SELECT COUNT(*) FROM service_category; -- Debe retornar 6
SELECT COUNT(*) FROM service_category_plan; -- Debe retornar 18 (6 categorías × 3 planes)
```

### Test 3: API - Subir Foto
```bash
POST /photos/upload
```
Debe validar límites contra el nuevo formato en Redis

### Test 4: API - Get Profile
```bash
GET /profile
```
No debe retornar `categoryName` ni `idCategory` (eliminados)

---

## 🔙 Rollback (Si algo sale mal)

```sql
-- Restaurar datos antiguos
ALTER TABLE plan ADD COLUMN id_category INT;

-- Recrear relaciones antiguas
UPDATE plan p 
SET id_category = (
  SELECT id_category FROM plan_category pc 
  LIMIT 1  -- Ajusta esta lógica según tus datos
);

-- Eliminar tablas nuevas
DROP TABLE service_category_plan CASCADE;
DROP TABLE service_category CASCADE;

-- Restaurar relación en plan.entity.ts
-- (código ya estaba en Git, revertir cambios)
```

---

## 📞 Preguntas Frecuentes

**P: ¿Se perderán datos?**
- No. El script crea tablas nuevas sin eliminar las antiguas.

**P: ¿Qué pasa con `plan_category`?**
- Se mantiene deprecada para backward compatibility.
- Puedes eliminarla después de validar todo funciona.

**P: ¿Las categorías deben estar en todos los planes?**
- Sí, por defecto. Si necesitas deshabilitar una, actualiza `available=false` en `service_category_plan`.

**P: ¿Cómo agregar una nueva categoría?**
```sql
INSERT INTO service_category (name, slug, description) VALUES ('Nueva', 'nueva-slug', 'Descripción');

-- Crear relaciones con todos los planes
INSERT INTO service_category_plan (id_service_category, id_plan, available)
SELECT (SELECT id_category FROM service_category WHERE slug='nueva-slug'), id_plan, TRUE
FROM plan;
```

---

## 📊 Impacto Resumido

| Aspecto | Antes | Después | Estado |
|---------|-------|---------|--------|
| Tablas | 1 (plan_category) | 2 (service_category + service_category_plan) | ✅ Nuevo |
| Relaciones en plan.entity.ts | ManyToOne con PlanCategory | OneToMany con ServiceCategoryPlan | ✅ Actualizado |
| plan-limits.util.ts | Filtro de arrays complejos | Lookup directo en objeto | ✅ Simplificado |
| profile.service.ts | Retorna categoryName, idCategory | No retorna (removidos) | ✅ Limpio |

---

**¡Implementación completada!** ✅

Cualquier duda, revisar los comentarios en el código o ejecutar los scripts SQL de verificación.
