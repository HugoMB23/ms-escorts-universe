# 📱 Cómo el Frontend Consume `GET /redis/plans`

## 🎯 El Problema Que Solucionamos

Antes, el JSON que retornaba `GET /redis/plans` **NO incluía "Big Bang" para "Masajista Hombre"**. Ahora SÍ lo incluye.

```json
// ANTES ❌
{
  "label": "Masajista Hombre",
  "plans": [
    { "id": "masajista-hombre-nebulosa", ... },
    { "id": "masajista-hombre-supernova", ... }
    // ❌ Falta masajista-hombre-big-bang
  ]
}

// AHORA ✅
{
  "label": "Masajista Hombre",
  "plans": [
    { "id": "masajista-hombre-nebulosa", ... },
    { "id": "masajista-hombre-supernova", ... },
    { "id": "masajista-hombre-big-bang", ... }  // ✅ YA ESTÁ
  ]
}
```

---

## 📊 Ejemplo de Respuesta Completa

Ver archivo: `EJEMPLO_RESPUESTA_PLANES.json`

La respuesta es un **array de categorías**:

```json
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
```

---

## 💻 Cómo Usa el Frontend Este JSON

### Caso 1: Mostrar un plan específico

```javascript
// Frontend obtiene los planes
const response = await fetch('http://backend:3000/redis/plans');
const plans = await response.json();

// Busca "masajista-hombre-big-bang"
const masajistaHombre = plans.find(cat => cat.value === 'masajista-hombre');
const bigBangPlan = masajistaHombre.plans.find(p => p.id === 'masajista-hombre-big-bang');

if (bigBangPlan) {
  // Renderiza el plan en la UI
  console.log(`Precio: ${bigBangPlan.price[0].price}`);
  console.log(`Fotos: ${bigBangPlan.mediaLimit.photos}`);
  console.log(`Videos: ${bigBangPlan.mediaLimit.videos}`);
  // ...
}
```

**Resultado Actual:**
```
✅ bigBangPlan EXISTE (gracias al cambio)
✅ Se renderiza en la UI
✅ El usuario ve "Big Bang" para "Masajista Hombre"
```

---

### Caso 2: Listar todos los planes de una categoría

```javascript
// Frontend itera sobre las categorías
plans.forEach(category => {
  console.log(`Categoría: ${category.label}`);
  category.plans.forEach(plan => {
    console.log(`  - ${plan.title} (${plan.mediaLimit.photos} fotos)`);
  });
});
```

**Salida con los cambios:**
```
Categoría: Escort Mujer
  - Nebulosa (4 fotos)
  - Supernova (3 fotos)
  - Big Bang (18 fotos)
Categoría: Escort Hombre
  - Nebulosa (4 fotos)
  - Supernova (3 fotos)
  - Big Bang (18 fotos)
...
Categoría: Masajista Hombre
  - Nebulosa (4 fotos)
  - Supernova (3 fotos)
  - Big Bang (18 fotos)  ← ✅ ANTES NO ESTABA
```

---

### Caso 3: Usar mediaLimit para validar uploads

```javascript
// Usuario quiere subir 20 fotos pero está en plan Nebulosa
const userPlan = 'escort-mujer-nebulosa';
const plans = await fetch('http://backend:3000/redis/plans').then(r => r.json());

// Busca el plan del usuario
let userPlanData = null;
for (const category of plans) {
  userPlanData = category.plans.find(p => p.id === userPlan);
  if (userPlanData) break;
}

const maxPhotos = userPlanData.mediaLimit.photos; // 4
const photosToUpload = 20;

if (photosToUpload > maxPhotos) {
  alert(`❌ Solo puedes subir ${maxPhotos} fotos en el plan ${userPlanData.title}`);
} else {
  // Proceder con upload
}
```

---

### Caso 4: Renderizar lista de planes en UI (React)

```jsx
import { useEffect, useState } from 'react';

export function PlansSelector() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetch('http://backend:3000/redis/plans')
      .then(r => r.json())
      .then(setPlans);
  }, []);

  return (
    <div>
      {plans.map(category => (
        <div key={category.value} className="category-group">
          <h2>{category.label}</h2>
          <div className="plans-grid">
            {category.plans.map(plan => (
              <div key={plan.id} className="plan-card">
                <img src={plan.icon} alt={plan.title} />
                <h3>{plan.title}</h3>
                <p>Fotos: {plan.mediaLimit.photos}</p>
                <p>Videos: {plan.mediaLimit.videos}</p>
                {plan.price && (
                  <div className="prices">
                    {plan.price.map(p => (
                      <span key={p.value}>{p.label}: {p.price}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

Con los cambios, esta UI ahora **SÍ RENDERIZA** `masajista-hombre-big-bang`.

---

## 🔄 Flujo Completo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. BD (PostgreSQL)                                              │
│    service_category: Masajista Hombre                           │
│    plan: Nebulosa, Supernova, Big Bang                          │
│    service_category_plan: M:N relaciones                        │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Backend (NestJS)                                             │
│    GET /redis/plans → RedisService.getPlans()                  │
│    Construye JSON dinámicamente desde BD                        │
│    Cachea en Redis                                              │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Frontend (React)                                             │
│    fetch('GET /redis/plans')                                    │
│    Recibe array con todas las categorías y planes               │
│    Renderiza UI con: masajista-hombre-big-bang INCLUIDO         │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Usuario Final                                                │
│    Ve "Big Bang" como opción para "Masajista Hombre"           │
│    Puede seleccionarlo, comprar y usarlo                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Validaciones en el Frontend

El frontend típicamente valida:

```javascript
// 1. ¿El plan existe?
if (!plan) {
  console.error('Plan no encontrado');
  return;
}

// 2. ¿El usuario tiene acceso a este plan?
if (!user.purchasedPlans.includes(plan.id)) {
  return <button>Comprar Plan</button>;
}

// 3. ¿Cuántos fotos puede subir?
const maxPhotos = plan.mediaLimit.photos;
if (userPhotos.length > maxPhotos) {
  return <error>Excede límite de fotos</error>;
}

// 4. ¿El plan está disponible en su región?
if (!plan.customPrice[userRegion]) {
  return <warning>Plan no disponible en tu región</warning>;
}
```

Con el cambio de hoy, **todas estas validaciones ahora funcionan correctamente para "masajista-hombre-big-bang"**.

---

## 🎯 Resumen

| Aspecto | Antes ❌ | Ahora ✅ |
|--------|---------|---------|
| masajista-hombre-big-bang en JSON | NO | SÍ |
| Frontend puede mostrar el plan | NO | SÍ |
| Usuario puede comprarlo | NO | SÍ |
| Sincronización con BD | Manual | Automática |
| Necesita actualizar plans_config | SÍ | NO |

---

## 🚀 Testing

Para verificar que funciona:

```bash
# 1. Obtener todos los planes
curl http://localhost:3000/redis/plans | jq '.'

# 2. Filtrar solo Masajista Hombre
curl http://localhost:3000/redis/plans | jq '.[] | select(.value == "masajista-hombre")'

# 3. Verificar que incluye big-bang
curl http://localhost:3000/redis/plans | jq '.[] | select(.value == "masajista-hombre") | .plans | map(.id)'

# Resultado esperado:
# [
#   "masajista-hombre-nebulosa",
#   "masajista-hombre-supernova",
#   "masajista-hombre-big-bang"  ← ✅ YA EXISTE
# ]
```
