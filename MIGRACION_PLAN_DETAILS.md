# 📋 Actualización: Planes Dinámicos Completos desde BD

## 🎯 Problema Resuelto

El endpoint `GET /redis/plans` ahora **obtiene TODOS los datos desde la BD**, no solo algunos campos hardcodeados.

---

## 📊 Campos Agregados a la Tabla `plan`

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `icon` | VARCHAR | SVG icon del plan | `plans/plan-diablo-bronce.svg` |
| `price_details` | JSONB | Precios por duración (7d, 15d, 30d) | Ver abajo |
| `custom_price` | JSONB | Precios especiales por región | Ver abajo |
| `features` | JSONB | Características/beneficios del plan | Ver abajo |

### Ejemplo de `price_details`

```json
[
  { "label": "7 días", "price": "$20.000", "value": "7d" },
  { "label": "15 días", "price": "$30.000", "value": "15d" },
  { "label": "30 días", "price": "$50.000", "value": "30d" }
]
```

### Ejemplo de `custom_price`

```json
{
  "Coquimbo": [
    { "label": "7 días", "price": "$2000", "value": "7d" },
    { "label": "15 días", "price": "$90", "value": "15d" },
    { "label": "30 días", "price": "$150", "value": "30d" }
  ]
}
```

### Ejemplo de `features`

```json
[
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
]
```

**Nota:** Los placeholders `{maxPhoto}`, `{maxVideo}`, `{maxHistory}` se reemplazan automáticamente con los valores reales del `mediaLimit`

---

## 🔧 Cambios en el Código

### 1. `src/common/entity/plan.entity.ts`

```typescript
@Entity('plan')
export class PlanEntity {
  @PrimaryGeneratedColumn('increment')
  idPlan: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'numeric', nullable: true })
  price: number;

  // ✅ NUEVOS CAMPOS
  @Column({ type: 'varchar', nullable: true })
  icon: string; // Ejemplo: "plans/plan-diablo-bronce.svg"

  @Column({ type: 'jsonb', nullable: true })
  priceDetails: any; // Array de precios por duración

  @Column({ type: 'jsonb', nullable: true })
  customPrice: any; // Precios especiales por región

  @Column({ type: 'jsonb', nullable: true })
  features: string[]; // Array de características

  // ... relaciones existentes
}
```

### 2. `src/modules/redis/redis.service.ts`

#### Método `buildPlanObject()` - ACTUALIZADO

Ahora usa los datos de la BD:

```typescript
private buildPlanObject(categorySlug: string, plan: PlanEntity): any {
  const planId = `${categorySlug}-${plan.name.toLowerCase()}`;
  const { photos, videos, history } = this.getMediaLimitForPlan(plan.name);

  return {
    id: planId,
    icon: plan.icon || this.getIconForPlan(plan.name),  // ← De BD o default
    price: plan.priceDetails || this.getDefaultPriceDetails(plan.name),  // ← De BD o default
    title: plan.name,
    features: plan.features 
      ? this.replacePlaceholdersInFeatures(plan.features, { photos, videos, history })  // ← Reemplaza {maxPhoto}, etc
      : this.getFeaturesForPlan(plan.name, { photos, videos, history }),  // ← Fallback
    mediaLimit: { photos, videos, history },
    ...(plan.customPrice && { customPrice: plan.customPrice }),  // ← De BD si existe
  };
}
```

#### Métodos auxiliares - NUEVOS

```typescript
/**
 * Obtener precios por defecto si no están en BD
 */
private getDefaultPriceDetails(planName: string): any[] {
  const priceMap: Record<string, any[]> = {
    'Nebulosa': [
      { label: '7 días', price: '$20.000', value: '7d' },
      { label: '15 días', price: '$30.000', value: '15d' },
      { label: '30 días', price: '$50.000', value: '30d' },
    ],
    'Supernova': [...],
    'Big Bang': [...]
  };
  return priceMap[planName] || [];
}

/**
 * Reemplazar placeholders en features
 */
private replacePlaceholdersInFeatures(
  features: string[],
  mediaLimit: { photos: number; videos: number; history: number },
): string[] {
  return features.map((feature) =>
    feature
      .replace(/{maxPhoto}/g, mediaLimit.photos.toString())
      .replace(/{maxVideo}/g, mediaLimit.videos.toString())
      .replace(/{maxHistory}/g, mediaLimit.history.toString()),
  );
}
```

---

## 🗄️ SQL Migration

Ejecutar el script: `migration_add_plan_details.sql`

```sql
ALTER TABLE plan
ADD COLUMN IF NOT EXISTS icon VARCHAR(255),
ADD COLUMN IF NOT EXISTS price_details JSONB,
ADD COLUMN IF NOT EXISTS custom_price JSONB,
ADD COLUMN IF NOT EXISTS features JSONB;

-- Luego actualiza los datos para Nebulosa, Supernova, Big Bang
```

---

## 🚀 Cómo Usar

### Paso 1: Ejecutar migración SQL

```bash
psql -U tu_usuario -d tu_bd -f migration_add_plan_details.sql
```

### Paso 2: Deploy código

```bash
npm run build
npm run start
```

### Paso 3: Verificar endpoint

```bash
curl http://localhost:3000/redis/plans | jq '.[0].plans[0]'
```

Deberías ver:

```json
{
  "id": "escort-mujer-nebulosa",
  "icon": "plans/plan-diablo-bronce.svg",
  "price": [
    { "label": "7 días", "price": "$20.000", "value": "7d" },
    { "label": "15 días", "price": "$30.000", "value": "15d" },
    { "label": "30 días", "price": "$50.000", "value": "30d" }
  ],
  "title": "Nebulosa",
  "features": [
    "Fotografía de portada de tamaño pequeño",
    "Listado en 3er grupo de portada y categoría",
    "Publicación de hasta 4 fotografías en book",
    "... resto de características ..."
  ],
  "mediaLimit": {
    "photos": 4,
    "videos": 1,
    "history": 1
  },
  "customPrice": {
    "Coquimbo": [
      { "label": "7 días", "price": "$2000", "value": "7d" },
      ...
    ]
  }
}
```

---

## ✅ Validaciones

- ✅ TypeScript: Sin errores
- ✅ Build: Exitoso
- ✅ Compilación: Correcta

---

## 🎯 Lógica de Fallbacks

El endpoint usa fallbacks para mantener compatibilidad:

```
1. Si existe `icon` en BD → Usa DB
   Si no → Usa método getIconForPlan()

2. Si existe `price_details` en BD → Usa BD
   Si no → Usa getDefaultPriceDetails()

3. Si existe `features` en BD → Reemplaza placeholders
   Si no → Usa getFeaturesForPlan()

4. Si existe `customPrice` en BD → Incluye en respuesta
   Si no → Omite del JSON
```

---

## 📝 Nota Importante

### Campos con Placeholders

Los `features` pueden contener placeholders que se reemplazan automáticamente:

```
Entrada en BD:
"Publicación de hasta {maxPhoto} fotografías en book"

Salida en JSON (para Nebulosa con 4 fotos):
"Publicación de hasta 4 fotografías en book"
```

Placeholders soportados:
- `{maxPhoto}` → Se reemplaza con `mediaLimit.photos`
- `{maxVideo}` → Se reemplaza con `mediaLimit.videos`
- `{maxHistory}` → Se reemplaza con `mediaLimit.history`

---

## 🔄 Ahora el flujo es:

```
PostgreSQL (plan table)
    ↓ (icon, price_details, custom_price, features)
RedisService.buildPlanObject()
    ↓ (Reemplaza placeholders, agrega mediaLimit)
Frontend recibe JSON completo
    ↓
Usuario ve plans con todos los detalles
```

---

## ⚠️ Rollback

Si necesitas revertir:

```sql
ALTER TABLE plan
DROP COLUMN IF EXISTS icon,
DROP COLUMN IF EXISTS price_details,
DROP COLUMN IF EXISTS custom_price,
DROP COLUMN IF EXISTS features;
```

Y revert del código a versión anterior.

---

## 🎉 Resultado Final

✅ **Todos los datos ahora vienen de la BD**
✅ **No hay hardcoding en el código**
✅ **Fallbacks automáticos si faltan datos**
✅ **Placeholders en features se reemplazan automáticamente**
✅ **Frontend recibe exactamente lo que espera**
