# Receta

Colección: `recipes`  
Fuente: `backend/src/models/Recipe.js`

## Campos principales

| Campo | Tipo | Obligatorio | Restricciones | Valor por omisión |
|---|---|---:|---|---|
| `_id` | `ObjectId` | Sí | Clave primaria generada por MongoDB | — |
| `titulo` | `String` | Sí | Sin espacios exteriores | — |
| `descripcion` | `String` | Sí | Sin espacios exteriores | — |
| `ingredientes` | `String[]` | Sí | Por lo menos un ingrediente no vacío en la interfaz | — |
| `instrucciones` | `String` | Sí | Texto libre | — |
| `imagen` | `String` | No | Identificador del archivo en `uploads.files`; cadena vacía significa sin imagen | `""` |
| `categoria` | `String` | No | Texto libre | `"Otro"` |
| `tiempoPreparacion` | `Number` | No | Minutos | `0` |
| `dificultad` | `String` | No | `Fácil`, `Media` o `Difícil` | `"Media"` |
| `porciones` | `Number` | No | Porciones estimadas | `1` |
| `publica` | `Boolean` | No | Las recetas son privadas salvo cambio explícito | `false` |
| `usuario` | `ObjectId` | Sí | Referencia a `User` | — |
| `createdAt` | `Date` | Sí | Generado por Mongoose | — |
| `updatedAt` | `Date` | Sí | Generado por Mongoose | — |

## Campos sociales derivados

Los contadores se mantienen como caché para listar sin agregaciones. El detalle
por usuario vive en colecciones propias (`likes`, `saves`, `comments`, `reviews`,
`reports`).

| Campo | Tipo | Significado |
|---|---|---|
| `likesCount` | `Number` | Total de “me gusta”; equivale a `countDocuments` en `likes` |
| `guardadosCount` | `Number` | Total de guardados; equivale a `countDocuments` en `saves` |
| `comentariosCount` | `Number` | Total derivado de comentarios |
| `ratingPromedio` | `Number` | Promedio de reseñas redondeado a un decimal |
| `ratingCount` | `Number` | Total de reseñas |
| `compartidosCount` | `Number` | Total derivado de compartir |
| `hashtags` | `String[]` | Etiquetas normalizadas a minúsculas |

## Índices

| Índice | Uso |
|---|---|
| `{ usuario: 1, createdAt: -1 }` | Tablero personal y perfil |
| `{ categoria: 1 }` | Filtro por categoría |
| `{ publica: 1 }` | Listado público |

## Relaciones

- Cada receta pertenece exactamente a un usuario.
- Cada receta puede tener muchos comentarios, reseñas, “me gusta”, guardados y reportes,
  cada uno en su propia colección (ver `like.md`, `guardado.md`, `reporte.md`).
- `imagen` no usa `ref` de Mongoose; contiene como texto el `_id` del archivo correspondiente en `uploads.files`.

## Ejemplo

```json
{
  "_id": "68ea00000000000000000010",
  "titulo": "Frijoles volteados",
  "descripcion": "Receta tradicional",
  "ingredientes": ["frijoles", "cebolla", "sal"],
  "instrucciones": "Freír los frijoles...",
  "imagen": "68ea00000000000000000100",
  "categoria": "Plato principal",
  "tiempoPreparacion": 30,
  "dificultad": "Media",
  "porciones": 4,
  "publica": true,
  "usuario": "68ea00000000000000000001",
  "likesCount": 0,
  "guardadosCount": 0,
  "comentariosCount": 0,
  "ratingPromedio": 0,
  "ratingCount": 0,
  "compartidosCount": 0,
  "hashtags": ["tradicional"]
}
```
