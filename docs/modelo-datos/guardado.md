# Guardado

Colección: `saves`  
Fuente: `backend/src/models/Save.js`

Registra que un usuario guardó una receta. Es el único mecanismo de “favorito
personal” del sistema. El total agregado se cachea en `Recipe.guardadosCount`.

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
| `{ usuario: 1, receta: 1 }`, único | Evita guardados duplicados |
| `{ receta: 1 }` | Conteo de guardados por receta |

## Relaciones

- Un usuario puede guardar muchas recetas.
- Una receta puede ser guardada por muchos usuarios.
- Al borrar una receta se eliminan sus documentos en `saves`.
