# Like (“me gusta”)

Colección: `likes`  
Fuente: `backend/src/models/Like.js`

Registra un “me gusta” de un usuario sobre una receta. El total agregado se
cachea en `Recipe.likesCount`.

## Campos

| Campo | Tipo | Obligatorio | Restricciones | Valor por omisión |
|---|---|---:|---|---|
| `_id` | `ObjectId` | Sí | Clave primaria generada por MongoDB | — |
| `usuario` | `ObjectId` | Sí | Referencia a `User` | — |
| `receta` | `ObjectId` | Sí | Referencia a `Recipe` | — |
| `createdAt` | `Date` | Sí | Generado por Mongoose | — |
| `updatedAt` | `Date` | Sí | Generado por Mongoose | — |

## Índices

| Índice | Uso |
|---|---|
| `{ usuario: 1, receta: 1 }`, único | Evita “me gusta” duplicados |
| `{ receta: 1 }` | Conteo de “me gusta” por receta |

## Relaciones

- Un usuario puede dar “me gusta” a muchas recetas.
- Una receta puede recibir “me gusta” de muchos usuarios.
- Al borrar una receta se eliminan sus documentos en `likes`.
