# 📊 JSON Final del Endpoint `/redis/plans`

## Resumen Visual

```
GET /redis/plans

↓

ARRAY de 6 categorías (categorías de servicio):
  ├─ Escort Mujer
  ├─ Escort Hombre
  ├─ Escort Trans
  ├─ Fantasías
  ├─ Masajista Mujer
  └─ Masajista Hombre
       └─ 3 planes cada una:
          ├─ Nebulosa
          ├─ Supernova
          └─ Big Bang (✅ AHORA SÍ EXISTE)
             └─ Detalles completos:
                ├─ id
                ├─ icon (SVG)
                ├─ price (array con 7d, 15d, 30d)
                ├─ title
                ├─ features (características con valores reales)
                ├─ mediaLimit (fotos, videos, historias)
                └─ customPrice (precios por región - opcional)
```

---

## Estructura por Plan

### Ejemplo: `masajista-hombre-big-bang`

```json
{
  "id": "masajista-hombre-big-bang",
  "icon": "plans/plan-diablo-gold.svg",
  "price": [
    {
      "label": "7 días",
      "price": "$50",
      "value": "7d"
    },
    {
      "label": "15 días",
      "price": "$90",
      "value": "15d"
    },
    {
      "label": "30 días",
      "price": "$150",
      "value": "30d"
    }
  ],
  "title": "Big Bang",
  "features": [
    "Fotografía de portada de tamaño grande",
    "Listado en 1er grupo de portada y categoría",
    "Publicación de hasta 18 fotografías en book",        ← {maxPhoto} reemplazado
    "Carga de hasta 18 fotos nuevas",                      ← {maxPhoto} reemplazado
    "Publicación de 3 video en book",                      ← {maxVideo} reemplazado
    "Carga de 3 video en book",                            ← {maxVideo} reemplazado
    "Publicación de 3 historias al día",                   ← {maxHistory} reemplazado
    "Anuncio en promoción hasta por 30 días",
    "Acceso a plataforma de autoservicio 24hrs",
    "Asistencia telefónica en horario de oficina"
  ],
  "mediaLimit": {
    "photos": 18,
    "videos": 3,
    "history": 3
  },
  "customPrice": {
    "Coquimbo": [
      {
        "label": "7 días",
        "price": "$2000",
        "value": "7d"
      },
      {
        "label": "15 días",
        "price": "$90",
        "value": "15d"
      },
      {
        "label": "30 días",
        "price": "$150",
        "value": "30d"
      }
    ]
  }
}
```

---

## Estructura Completa

### Nivel 1: Array de Categorías

```json
[
  {
    "label": "Escort Mujer",
    "value": "escort",
    "plans": [...]
  },
  {
    "label": "Masajista Hombre",
    "value": "masajista-hombre",
    "plans": [...]
  },
  ...
]
```

### Nivel 2: Planes dentro de cada Categoría

```json
{
  "label": "Masajista Hombre",
  "value": "masajista-hombre",
  "plans": [
    {
      "id": "masajista-hombre-nebulosa",
      "icon": "plans/plan-diablo-bronce.svg",
      "price": [...],
      "title": "Nebulosa",
      "features": [...],
      "mediaLimit": {...},
      "customPrice": {...}
    },
    {
      "id": "masajista-hombre-supernova",
      ...
    },
    {
      "id": "masajista-hombre-big-bang",  ← ✅ AHORA SÍ EXISTE
      ...
    }
  ]
}
```

---

## 📋 Origen de Cada Campo

| Campo | Origen | Ejemplo |
|-------|--------|---------|
| `id` | Generado en código | `escort-mujer-nebulosa` |
| `icon` | `plan.icon` de BD | `plans/plan-diablo-bronce.svg` |
| `price` | `plan.price_details` de BD | Array con 3 duraciones |
| `title` | `plan.name` de BD | `Nebulosa`, `Supernova`, `Big Bang` |
| `features` | `plan.features` de BD + reemplazo | Features con {maxPhoto} → 4 |
| `mediaLimit` | `getMediaLimitForPlan()` | `{ photos: 4, videos: 1, history: 1 }` |
| `customPrice` | `plan.custom_price` de BD (opcional) | Precios por región |

---

## 🔄 Flujo de Datos para cada Plan

```
1. BD (tabla plan)
   ├─ icon: "plans/plan-diablo-bronce.svg"
   ├─ price_details: [{ label: "7 días", price: "$50", value: "7d" }, ...]
   ├─ features: ["Feature 1 con {maxPhoto}", "Feature 2 con {maxVideo}", ...]
   ├─ custom_price: { "Coquimbo": [...] }
   └─ name: "Nebulosa"

   ↓

2. RedisService.buildPlanObject()
   ├─ Obtiene plan.icon → "plans/plan-diablo-bronce.svg"
   ├─ Obtiene plan.price_details → Array de precios
   ├─ Obtiene plan.features → ["Feature 1 con {maxPhoto}", ...]
   ├─ Genera mediaLimit → { photos: 4, videos: 1, history: 1 }
   ├─ Reemplaza placeholders:
   │  └─ "Feature 1 con {maxPhoto}" → "Feature 1 con 4"
   ├─ Obtiene plan.custom_price → { "Coquimbo": [...] }
   └─ Genera id → "escort-mujer-nebulosa"

   ↓

3. JSON retornado al Frontend
   {
     "id": "escort-mujer-nebulosa",
     "icon": "plans/plan-diablo-bronce.svg",
     "price": [...],
     "title": "Nebulosa",
     "features": [
       "Feature 1 con 4",
       "Feature 2 con 1",
       ...
     ],
     "mediaLimit": { "photos": 4, "videos": 1, "history": 1 },
     "customPrice": { "Coquimbo": [...] }
   }
```

---

## ✨ Diferencias Clave

### ANTES ❌ (Hardcodeado)

```javascript
return {
  id: `${categorySlug}-${plan.name.toLowerCase()}`,
  icon: "plans/plan-diablo-bronce.svg",  // ❌ Mismo para todos
  price: [{ label: "7 días", price: "$50", value: "7d" }, ...],  // ❌ Hardcodeado
  features: [
    "Fotografía de portada...",
    "Listado en 3er grupo...",
    "Publicación de hasta 4 fotografías..."  // ❌ Valor fijo
  ],
  customPrice: { Coquimbo: [...] }  // ❌ Hardcodeado
}
```

### AHORA ✅ (Desde BD)

```javascript
return {
  id: `${categorySlug}-${plan.name.toLowerCase()}`,
  icon: plan.icon || getDefault(),  // ✅ De BD
  price: plan.priceDetails || getDefault(),  // ✅ De BD
  features: replacePlaceholders(plan.features),  // ✅ De BD + reemplaza
  customPrice: plan.customPrice  // ✅ De BD si existe
}
```

---

## 🎯 Verificar en Frontend

```javascript
// Frontend obtiene la respuesta
const plans = await fetch('http://backend/redis/plans').then(r => r.json());

// Busca Masajista Hombre
const masajistHombre = plans.find(cat => cat.value === 'masajista-hombre');

// Verifica que tenga 3 planes
console.log(masajistHombre.plans.length);  // 3 ✅

// Verifica que incluya Big Bang
const bigBang = masajistHombre.plans.find(p => p.id === 'masajista-hombre-big-bang');
console.log(bigBang.title);  // "Big Bang" ✅
console.log(bigBang.mediaLimit);  // { photos: 18, videos: 3, history: 3 } ✅
```

---

## 📊 Estadísticas del JSON

| Métrica | Valor |
|---------|-------|
| Categorías | 6 |
| Planes por categoría | 3 |
| Total de planes | 18 |
| Campos por plan | 7 (id, icon, price, title, features, mediaLimit, customPrice) |
| Features por plan | 10 |
| Precios por plan | 3 (7d, 15d, 30d) |
| Regiones con precios especiales | Mínimo 1 (Coquimbo) |

---

## ✅ Conclusión

**El JSON final contiene TODOS los datos que el frontend necesita, obtenidos dinámicamente desde la BD, sin valores hardcodeados.**

Archivo de ejemplo completo: `JSON_RESPUESTA_FINAL.json`
