# Actividad del feed

Colección: `activityfeeds`  
Fuente: `backend/src/models/ActivityFeed.js`

## Campos

| Campo | Tipo | Obligatorio | Restricciones | Valor por omisión |
|---|---|---:|---|---|
| `_id` | `ObjectId` | Sí | Clave primaria generada por MongoDB | — |
| `usuario` | `ObjectId` | Sí | Referencia a `User` | — |
| `tipo` | `String` | Sí | Uno de los tipos enumerados abajo | — |
| `referencia.tipo` | `String` | Sí | `Recipe`, `Comment`, `Review` o `User` | — |
| `referencia.id` | `ObjectId` | Sí | Identificador del recurso relacionado | — |
| `metadata.recetaTitulo` | `String` | No | Título desnormalizado para mostrar el feed | — |
| `metadata.autorNombre` | `String` | No | Nombre desnormalizado del actor | — |
| `createdAt` | `Date` | Sí | Generado por Mongoose | — |
| `updatedAt` | `Date` | Sí | Generado por Mongoose | — |

## Tipos admitidos actualmente

- `creo_receta`
- `comento_receta`
- `reseno_receta`
- `likio_receta`
- `guardo_receta`
- `siguio_usuario`

El backend emite actualmente `compartio_receta` al compartir, pero ese valor no está incluido en la enumeración del modelo; por eso compartir puede devolver HTTP 500 después de incrementar el contador.

## Índices

- `{ usuario: 1, createdAt: -1 }`.

## Ejemplo

```json
{
  "_id": "68ea00000000000000000050",
  "usuario": "68ea00000000000000000001",
  "tipo": "comento_receta",
  "referencia": {
    "tipo": "Comment",
    "id": "68ea00000000000000000020"
  },
  "metadata": {
    "recetaTitulo": "Frijoles volteados",
    "autorNombre": "Demo"
  },
  "createdAt": "2026-10-15T00:00:00.000Z",
  "updatedAt": "2026-10-15T00:00:00.000Z"
}
```
