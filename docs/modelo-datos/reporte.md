# Reporte

Colección: `reports`  
Fuente: `backend/src/models/Report.js`

Registra un reporte de un usuario sobre una receta para su moderación.

## Campos

| Campo | Tipo | Obligatorio | Restricciones | Valor por omisión |
|---|---|---:|---|---|
| `_id` | `ObjectId` | Sí | Clave primaria generada por MongoDB | — |
| `usuario` | `ObjectId` | Sí | Referencia a `User` | — |
| `receta` | `ObjectId` | Sí | Referencia a `Recipe` | — |
| `motivo` | `String` | No | Máximo 500 caracteres | `""` |
| `estado` | `String` | No | `pendiente`, `descartado` o `resuelto` | `"pendiente"` |
| `createdAt` | `Date` | Sí | Generado por Mongoose | — |
| `updatedAt` | `Date` | Sí | Generado por Mongoose | — |

## Índices

| Índice | Uso |
|---|---|
| `{ usuario: 1, receta: 1 }`, único | Un usuario reporta una receta una sola vez |
| `{ receta: 1, estado: 1 }` | Consultas de moderación |

## Relaciones

- Un usuario puede reportar muchas recetas.
- Una receta puede recibir reportes de muchos usuarios.
- Al borrar una receta se eliminan sus documentos en `reports`.
