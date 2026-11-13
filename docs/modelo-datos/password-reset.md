# Colección `passwordresets`

Almacena códigos temporales de recuperación de contraseña. Un documento por solicitud; se elimina automáticamente al expirar.

## Campos

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `_id` | ObjectId | Sí | Identificador generado por MongoDB |
| `usuario` | ObjectId (ref `User`) | Sí | Usuario que solicitó la recuperación |
| `codigoHash` | String | Sí | Código de 6 dígitos hasheado con bcrypt |
| `expiraEn` | Date | Sí | Fecha de expiración (15 minutos desde la creación) |
| `usado` | Boolean | No (default `false`) | Indica si el código ya fue utilizado |
| `createdAt` | Date | Auto | Fecha de creación |
| `updatedAt` | Date | Auto | Fecha de última actualización |

## Índices

- `{ expiraEn: 1 }` con `expireAfterSeconds: 0` (TTL: MongoDB elimina el documento automáticamente al expirar).

## Notas

- El código se genera con `crypto.randomInt(100000, 999999)`.
- Solo se permite un código activo por usuario; las solicitudes anteriores se eliminan antes de crear uno nuevo.
- El código se hashea con bcrypt (10 rondas) antes de guardarse.
- El token de restablecimiento (JWT, 15 min, `purpose: "reset"`) se genera solo tras verificar el código correctamente.