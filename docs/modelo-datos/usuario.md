# Usuario

Colección: `users`  
Fuente: `backend/src/models/User.js`

## Campos

| Campo | Tipo | Obligatorio | Restricciones | Valor por omisión |
|---|---|---:|---|---|
| `_id` | `ObjectId` | Sí | Clave primaria generada por MongoDB | — |
| `name` | `String` | Sí | Se eliminan espacios exteriores | — |
| `email` | `String` | Sí | Único, minúsculas y sin espacios exteriores | — |
| `password` | `String` | Sí | Mínimo 8 caracteres; hash bcrypt; no se devuelve en consultas normales | — |
| `avatar` | `String` | No | URL o cadena vacía | `""` |
| `bio` | `String` | No | Máximo 500 caracteres | `""` |
| `stats.recetasCount` | `Number` | No | Contador derivado | `0` |
| `stats.seguidoresCount` | `Number` | No | Contador derivado | `0` |
| `stats.siguiendoCount` | `Number` | No | Contador derivado | `0` |
| `createdAt` | `Date` | Sí | Generado por Mongoose | — |
| `updatedAt` | `Date` | Sí | Generado por Mongoose | — |

## Relaciones

- Un usuario puede ser propietario de muchas recetas.
- Un usuario puede escribir muchos comentarios y reseñas.
- Un usuario puede seguir a muchos usuarios y ser seguido por muchos usuarios.
- Las interacciones sobre recetas (“me gusta”, guardados y reportes) se registran en
  colecciones propias referenciando al usuario; no se denormalizan en `users`.

## Ejemplo

```json
{
  "_id": "68ea00000000000000000001",
  "name": "Demo",
  "email": "demo@test.com",
  "avatar": "",
  "bio": "",
  "stats": {
    "recetasCount": 0,
    "seguidoresCount": 0,
    "siguiendoCount": 0
  },
  "createdAt": "2026-10-15T00:00:00.000Z",
  "updatedAt": "2026-10-15T00:00:00.000Z"
}
```
