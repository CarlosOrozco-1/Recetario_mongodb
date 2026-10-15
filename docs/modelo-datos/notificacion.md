# Notificación propuesta

Colección prevista: `notifications`  
Estado: **no implementada; especificación para la Fase 7.**

La campana actual reutiliza `GET /api/activity/feed`, filtra actividades propias en el navegador y trata todas las restantes como no leídas. Esta especificación define el modelo necesario para reemplazar ese comportamiento provisional.

## Campos propuestos

| Campo | Tipo | Obligatorio | Restricciones | Valor por omisión |
|---|---|---:|---|---|
| `_id` | `ObjectId` | Sí | Clave primaria generada por MongoDB | — |
| `destinatario` | `ObjectId` | Sí | Referencia a `User` | — |
| `actor` | `ObjectId` | Sí | Referencia al usuario que originó la notificación | — |
| `tipo` | `String` | Sí | `like`, `comment`, `reply`, `follow`, `review` o `share` | — |
| `recurso` | `ObjectId` | Sí | Referencia polimórfica al recurso relacionado | — |
| `metadata` | `Object` | No | Datos mínimos para mostrar la notificación | — |
| `leida` | `Boolean` | No | Estado persistente de lectura | `false` |
| `createdAt` | `Date` | Sí | Generado por Mongoose | — |
| `updatedAt` | `Date` | Sí | Generado por Mongoose | — |

## Índices propuestos

- `{ destinatario: 1, leida: 1, createdAt: -1 }`.
- Índice único sugerido para evitar duplicados por destinatario, actor, tipo y recurso.

## Reglas propuestas

- Nunca crear una notificación dirigida al mismo usuario que realizó la acción.
- Una acción de “me gusta” seguida por quitar el “me gusta” no debe dejar una notificación colgada.
- Solamente el destinatario puede marcar o borrar su notificación.
