# Comentario

Colección: `comments`  
Fuente: `backend/src/models/Comment.js`

## Campos

| Campo | Tipo | Obligatorio | Restricciones | Valor por omisión |
|---|---|---:|---|---|
| `_id` | `ObjectId` | Sí | Clave primaria generada por MongoDB | — |
| `texto` | `String` | Sí | Texto no vacío, máximo 1000 caracteres | — |
| `usuario` | `ObjectId` | Sí | Referencia a `User` | — |
| `receta` | `ObjectId` | Sí | Referencia a `Recipe` | — |
| `parentComment` | `ObjectId` | No | Referencia al comentario padre; `null` indica comentario principal | `null` |
| `eliminado` | `Boolean` | No | Borrado lógico | `false` |
| `createdAt` | `Date` | Sí | Generado por Mongoose | — |
| `updatedAt` | `Date` | Sí | Generado por Mongoose | — |

## Relaciones

- Cada comentario pertenece a un usuario y a una receta.
- Un comentario puede tener respuestas directas mediante `parentComment`.
- El backend actual solamente expone el primer nivel de respuestas; las respuestas a una respuesta no tienen actualmente una ruta de lectura completa.

## Índices

- `{ receta: 1, createdAt: -1 }`
- `{ usuario: 1, createdAt: -1 }`
- `{ parentComment: 1 }`

## Ejemplo

```json
{
  "_id": "68ea00000000000000000020",
  "texto": "Quedó excelente.",
  "usuario": "68ea00000000000000000002",
  "receta": "68ea00000000000000000010",
  "parentComment": null,
  "eliminado": false,
  "createdAt": "2026-10-15T00:00:00.000Z",
  "updatedAt": "2026-10-15T00:00:00.000Z"
}
```
