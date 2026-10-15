# Reseña

Colección: `reviews`  
Fuente: `backend/src/models/Review.js`

## Campos

| Campo | Tipo | Obligatorio | Restricciones | Valor por omisión |
|---|---|---:|---|---|
| `_id` | `ObjectId` | Sí | Clave primaria generada por MongoDB | — |
| `usuario` | `ObjectId` | Sí | Referencia a `User` | — |
| `receta` | `ObjectId` | Sí | Referencia a `Recipe` | — |
| `puntuacion` | `Number` | Sí | Entero conceptual entre 1 y 5 estrellas | — |
| `texto` | `String` | No | Máximo 2000 caracteres | `""` |
| `createdAt` | `Date` | Sí | Generado por Mongoose | — |
| `updatedAt` | `Date` | Sí | Generado por Mongoose | — |

## Relaciones

- Cada reseña pertenece a un usuario y a una receta.
- La combinación de `usuario` y `receta` debe ser única: un usuario solamente puede reseñar una receta una vez.

## Índices

- `{ usuario: 1, receta: 1 }`, único.
- `{ receta: 1, puntuacion: 1 }`.

## Ejemplo

```json
{
  "_id": "68ea00000000000000000030",
  "usuario": "68ea00000000000000000002",
  "receta": "68ea00000000000000000010",
  "puntuacion": 5,
  "texto": "Sabor casero y fácil de preparar.",
  "createdAt": "2026-10-15T00:00:00.000Z",
  "updatedAt": "2026-10-15T00:00:00.000Z"
}
```
