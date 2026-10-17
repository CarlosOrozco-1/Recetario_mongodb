# Referencia de la API

Base local: `http://localhost:3000/api`  
Autenticación: `Authorization: Bearer <token>` en todas las rutas salvo las indicadas como públicas.  
Límite global: 100 solicitudes cada 15 minutos para `/api`.

## Salud

| Método y ruta | Auth | Respuesta principal |
|---|---|---|
| `GET /api/health` | Pública | `200` con estado, conexión MongoDB, base de datos, host, puerto y marca temporal |

## Autenticación

| Método y ruta | Límites y saneado | Respuesta principal |
|---|---|---|
| `POST /api/auth/register` | 10 intentos cada 15 minutos; sanea `name` y `email` | `201` con `_id`, `name`, `email` y `token`; `400` si el usuario ya existe |
| `POST /api/auth/login` | 10 intentos cada 15 minutos | `200` con `_id`, `name`, `email` y `token`; `400` si el usuario o la contraseña son incorrectos |

El token dura 30 días. No hay cierre de sesión en el servidor: el frontend elimina el token guardado.

## Recetas

| Método y ruta | Límites y saneado | Respuesta principal |
|---|---|---|
| `POST /api/recipes` | 10 creaciones por minuto; sanea título, descripción, instrucciones, categoría y etiquetas | `201` con la receta y el propietario asignado por el servidor |
| `GET /api/recipes` | Autenticada | `200` con las recetas del usuario |
| `GET /api/recipes?scope=public` | Autenticada | `200` con las recetas públicas de otros usuarios más las propias |
| `GET /api/recipes/:id` | Autenticada; permite la receta si es del usuario o es pública | `200` con la receta; `404` si no existe o no es visible |
| `PUT /api/recipes/:id` | Autenticada; solamente acepta los 11 campos editables | `200` con la receta; `400` si no hay campos editables; `404` si no existe o no pertenece al usuario |
| `DELETE /api/recipes/:id` | Autenticada | `200` con confirmación; elimina también la imagen en GridFS y las filas asociadas en `likes`, `saves` y `reports`; `404` si no existe o no pertenece al usuario |

No existen búsqueda por texto, filtro por categoría en el servidor, paginación de recetas ni perfil por nombre de usuario.

## Imágenes

| Método y ruta | Auth | Respuesta principal |
|---|---|---|
| `GET /api/recipes/image/:fileId` | Pública | `200` con el archivo; `400` si el identificador es inválido; `404` si no existe |
| `POST /api/recipes/:id/image` | Propietario autenticado | `200` con la receta actualizada; elimina la imagen anterior; `400` sin archivo, tipo no permitido o archivo mayor de 5 MB; `404` si la receta no pertenece al usuario |

La subida acepta JPEG, PNG, WebP y GIF según el tipo MIME declarado. No valida los bytes reales del archivo.

## Interacciones sociales de recetas

| Método y ruta | Límites | Respuesta principal |
|---|---|---|
| `POST /api/recipes/:id/like` | 30 acciones por minuto | `200` con `liked` y `likesCount`; `400` si la receta es del propio usuario; `404` si la receta no existe |
| `POST /api/recipes/:id/save` | 30 acciones por minuto | `200` con `saved` y `guardadosCount`; `404` si la receta no existe |
| `POST /api/recipes/:id/share` | 30 acciones por minuto | `200` con `compartidosCount`; registra actividad `compartio_receta`; `404` si la receta no existe |
| `POST /api/recipes/:id/report` | 10 creaciones por minuto; sanea `motivo` | `201` con confirmación; crea un documento en `reports` con estado `pendiente`; `400` si el usuario ya reportó la receta; `404` si la receta no existe |

## Comentarios

| Método y ruta | Límites y saneado | Respuesta principal |
|---|---|---|
| `POST /api/comments` | 10 creaciones por minuto; sanea `texto` | `201` con el comentario y usuario; incrementa el contador de la receta |
| `GET /api/comments/receta/:recetaId` | 30 consultas por minuto | `200` con comentarios principales y sus respuestas directas |
| `PUT /api/comments/:id` | 10 creaciones por minuto; sanea `texto` | `200` con el comentario; solamente el autor; `404` si no existe |
| `DELETE /api/comments/:id` | 30 acciones por minuto | `200` con confirmación; borrado lógico y decremento del contador |

## Reseñas

| Método y ruta | Límites y saneado | Respuesta principal |
|---|---|---|
| `POST /api/reviews` | 10 creaciones por minuto; sanea texto y puntuación | `201` con la reseña; recalcula promedio y total; `400` si el usuario ya reseñó la receta |
| `GET /api/reviews/receta/:recetaId` | 30 consultas por minuto | `200` con las reseñas ordenadas por fecha descendente |
| `PUT /api/reviews/:id` | 10 creaciones por minuto; sanea texto y puntuación | `200` con la reseña y promedio recalculado; `404` si no existe o no pertenece al usuario |
| `DELETE /api/reviews/:id` | 30 acciones por minuto | `200` con confirmación y promedio recalculado; `404` si no existe o no pertenece al usuario |

## Seguimiento y actividad

| Método y ruta | Límites | Respuesta principal |
|---|---|---|
| `POST /api/follows` | 10 creaciones por minuto | `200` con `isFollowing`; `400` si el usuario intenta seguirse a sí mismo |
| `GET /api/follows/followers/:userId` | 30 consultas por minuto | `200` con los seguidores |
| `GET /api/follows/following/:userId` | 30 consultas por minuto | `200` con los usuarios seguidos |
| `GET /api/follows/check/:userId` | 30 consultas por minuto | `200` con `isFollowing` |
| `GET /api/activity/feed?page=&limit=` | 30 consultas por minuto | `200` con actividades dirigidas al usuario, sus seguidos o él mismo |
| `GET /api/activity/user/:userId` | 30 consultas por minuto | `200` con las últimas 50 actividades dirigidas a ese identificador |

No existe endpoint de búsqueda global ni endpoint de perfil público por nombre de usuario.
