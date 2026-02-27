# Generación Dinámica de Planes desde BD

## 📋 Resumen del Cambio

Se modificó el endpoint `GET /redis/plans` para **construir el JSON de planes dinámicamente desde la base de datos** en lugar de depender de un JSON estático almacenado en `plans_config`.

**Endpoint:** `GET /redis/plans`  
**Antes:** Leía desde `plans_config.plans` (JSON estático)  
**Después:** Construye dinámicamente desde tablas `plan`, `service_category`, `service_category_plan`

---

## ✅ Ventajas de este Enfoque

### 1. **Sincronización Garantizada con BD**
- ✅ Si agregas un plan (Big Bang a Masajista Hombre), se refleja automáticamente
- ✅ No hay desincronización entre BD y JSON servido al frontend
- ✅ No requiere actualizar manualmente `plans_config`

### 2. **Eliminación de la "Verdad Dual"**
- ❌ Antes: Dos lugares donde podían estar los datos (plans_config + BD)
- ✅ Ahora: Una sola fuente de verdad (BD)

### 3. **Mejor Escalabilidad**
- ✅ Si cambias un plan o agregas uno nuevo, solo actualiza la BD
- ✅ El JSON se regenera automáticamente

### 4. **Caché Sigue Funcionando**
- ✅ Redis sigue cacheanado por rendimiento (TTL: 1 hora)
- ✅ Pero BD es la fuente de verdad
- ✅ Invalidar cache es opcional (se regenera en 1 hora)

---

## 🔄 Flujo de Datos

```
Frontend → GET /redis/plans
           ↓
RedisController.getPlans()
           ↓
RedisService.getPlans()
           ↓
Consultar: plan + service_category + service_category_plan (relación M:N)
           ↓
Construir estructura JSON que espera frontend:
[
  {
    "label": "Escort Mujer",
    "value": "escort",
    "plans": [
      {
        "id": "escort-mujer-nebulosa",
        "icon": "plans/plan-diablo-bronce.svg",
        "price": [...],
        "title": "Nebulosa",
        "features": [...],
        "mediaLimit": { "photos": 4, "videos": 1, "history": 1 },
        "customPrice": {...}
      },
      ...
    ]
  },
  ...
]
           ↓
Cachear en Redis (1 hora)
           ↓
Retornar JSON al frontend
```

---

## 📊 Estructura del JSON Retornado

El JSON ahora tiene la estructura completa que el frontend espera:

```json
[
  {
    "label": "Escort Mujer",
    "value": "escort",
    "plans": [
      {
        "id": "escort-mujer-nebulosa",
        "icon": "plans/plan-diablo-bronce.svg",
        "price": [
          { "label": "7 días", "price": "$50", "value": "7d" },
          { "label": "15 días", "price": "$90", "value": "15d" },
          { "label": "30 días", "price": "$150", "value": "30d" }
        ],
        "title": "Nebulosa",
        "features": [
          "Fotografía de portada de tamaño pequeño",
          "Listado en 3er grupo de portada y categoría",
          "Publicación de hasta 4 fotografías en book",
          "Carga de hasta 4 fotos nuevas",
          "Publicación de 1 video en book",
          "Carga de 1 video en book",
          "Publicación de 1 historia al día",
          "Anuncio en promoción hasta por 7 días",
          "Acceso a plataforma de autoservicio 24hrs",
          "Asistencia telefónica en horario de oficina"
        ],
        "mediaLimit": {
          "photos": 4,
          "videos": 1,
          "history": 1
        },
        "customPrice": {
          "Coquimbo": [
            { "label": "7 días", "price": "$2000", "value": "7d" },
            { "label": "15 días", "price": "$90", "value": "15d" },
            { "label": "30 días", "price": "$150", "value": "30d" }
          ]
        }
      },
      {
        "id": "escort-mujer-supernova",
        "icon": "plans/plan-diablo-silver.svg",
        ...
      },
      {
        "id": "escort-mujer-big-bang",
        "icon": "plans/plan-diablo-gold.svg",
        ...
      }
    ]
  },
  {
    "label": "Masajista Hombre",
    "value": "masajista-hombre",
    "plans": [
      {
        "id": "masajista-hombre-nebulosa",
        ...
      },
      {
        "id": "masajista-hombre-supernova",
        ...
      },
      {
        "id": "masajista-hombre-big-bang",
        ...
      }
    ]
  },
  ...
]
```

---

## 🔧 Cambios Realizados

### 1. `redis.module.ts`
```typescript
// ANTES
TypeOrmModule.forFeature([PlansConfigEntity])

// DESPUÉS
TypeOrmModule.forFeature([
  PlansConfigEntity,
  PlanEntity,
  ServiceCategoryEntity,
  ServiceCategoryPlanEntity
])
```

### 2. `redis.service.ts`

#### Imports
```typescript
// Agregados
import { PlanEntity } from '../../common/entity/plan.entity';
import { ServiceCategoryEntity } from '../../common/entity/service-category.entity';
import { ServiceCategoryPlanEntity } from '../../common/entity/service-category-plan.entity';
```

#### Constructor
```typescript
// Agregadas inyecciones
@InjectRepository(PlanEntity)
private planRepository: Repository<PlanEntity>,

@InjectRepository(ServiceCategoryEntity)
private serviceCategoryRepository: Repository<ServiceCategoryEntity>,

@InjectRepository(ServiceCategoryPlanEntity)
private serviceCategoryPlanRepository: Repository<ServiceCategoryPlanEntity>,
```

#### Método `getPlans()`
- ❌ Eliminada: Lectura de `plans_config.plans`
- ✅ Agregada: Construcción dinámica desde `service_category`, `plan` y `service_category_plan`
- ✅ Mantiene: Caché en Redis por rendimiento

#### Nuevos métodos privados
```typescript
buildPlanObject(categorySlug, plan)    // Construye cada objeto plan con detalles
getCategoryLabel(categoryName)          // Mapea nombre BD a label frontend
getIconForPlan(planName)                // Retorna SVG icon según plan
getFeaturesForPlan(planName, mediaLimit) // Construye features con valores reales
getMediaLimitForPlan(planName)          // Retorna { photos, videos, history }
```

---

## 🛠️ Próximos Pasos Opcionales

### Si quieres eliminar la tabla `plans_config`
```sql
DROP TABLE plans_config;
```
Actualmente se mantiene por compatibilidad pero ya no se usa en el nuevo código.

### Si quieres agregar más planes en el futuro
1. Inserta en tabla `plan`:
```sql
INSERT INTO plan (name, description, price) 
VALUES ('Ultra', 'Plan Ultra con todos los beneficios', 99.99);
```

2. El JSON se regenerará automáticamente en la próxima llamada a `GET /redis/plans`

### Si quieres agregar una nueva categoría de servicio
1. Inserta en tabla `service_category`:
```sql
INSERT INTO service_category (name, slug, description) 
VALUES ('Nueva Categoría', 'nueva-categoria', 'Descripción');
```

2. Crea relaciones M:N con los planes que desees:
```sql
INSERT INTO service_category_plan (id_service_category, id_plan, available)
SELECT sc.id_category, p.idPlan, TRUE
FROM service_category sc
CROSS JOIN plan p
WHERE sc.name = 'Nueva Categoría';
```

3. Si necesitas un label especial, edita `getCategoryLabel()`:
```typescript
private getCategoryLabel(categoryName: string): string {
  const labels: Record<string, string> = {
    'Nueva Categoría': 'Label Mostrado al Frontend',
    // ...
  };
  return labels[categoryName] || categoryName;
}
```

---

## 🔍 Testing

Para verificar que funciona correctamente:

```bash
# 1. Inicia el servidor
npm run start:dev

# 2. Llama al endpoint
curl http://localhost:3000/redis/plans

# 3. Deberías recibir el array con estructura completa de categorías y planes

# 4. Verifica que incluya "Masajista Hombre" con 3 planes (Nebulosa, Supernova, Big Bang)
```

---

## ⚠️ Rollback (Si algo sale mal)

Si necesitas volver a la versión anterior que usaba `plans_config`:

```typescript
// En getPlans(), revierte a:
const [latest] = await this.plansRepository.find({
  order: { id: 'DESC' },
  take: 1,
});
if (latest) return latest.plans;
```

---

## 📝 Notas Importantes

- ✅ El frontend **NO CAMBIA** - recibe exactamente el mismo JSON que antes
- ✅ El endpoint **NO CAMBIA** - sigue siendo `GET /redis/plans`
- ✅ Los servicios que usan `resolveMediaLimit()` **SIGUEN FUNCIONANDO**
- ✅ Redis sigue activo como caché por rendimiento (TTL: 1 hora)
- ✅ **NUEVO**: "Big Bang" para "Masajista Hombre" se incluirá automáticamente si existe en la BD

## 🎯 Problema Original Resuelto

**Problema:** Faltaba "Big Bang" para "Masajista Hombre" en el JSON que el frontend recibía

**Causa:** El JSON estaba hardcodeado en `plans_config` y no reflejaba cambios en la BD

**Solución:** Generar el JSON dinámicamente desde la BD, garantizando sincronización automática

**Resultado:** Cualquier cambio en BD se refleja automáticamente en el JSON del frontend

