# Seguimiento

Colección: `follows`  
Fuente: `backend/src/models/Follow.js`

## Campos

| Campo | Tipo | Obligatorio | Restricciones | Valor por omisión |
|---|---|---:|---|---|
| `_id` | `ObjectId` | Sí | Clave primaria generada por MongoDB | — |
| `seguidor` | `ObjectId` | Sí | Referencia al usuario que sigue | — |
| `seguido` | `ObjectId` | Sí | Referencia al usuario seguido | — |
| `createdAt` | `Date` | Sí | Generado por Mongoose | — |
| `updatedAt` | `Date` | Sí | Generado por Mongoose | — |

## Relaciones

- Cada documento representa una relación dirigida de seguimiento.
- La pareja `seguidor`/`seguido` debe ser única.
- Un usuario no puede seguirse a sí mismo; esa regla se valida tanto en el controlador como en el modelo.

## Índices

- `{ seguidor: 1, seguido: 1 }`, único.
- `{ seguido: 1, createdAt: -1 }`.
- `{ seguidor: 1, createdAt: -1 }`.

## Ejemplo

```json
{
  "_id": "68ea00000000000000000040",
  "seguidor": "68ea00000000000000000002",
  "seguido": "68ea00000000000000000001",
  "createdAt": "2026-10-15T00:00:00.000Z",
  "updatedAt": "2026-10-15T00:00:00.000Z"
}
```
