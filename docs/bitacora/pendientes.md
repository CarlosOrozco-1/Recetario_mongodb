# Pendientes y tareas por hacer

## 1. Conexión a la base de datos (Atlas)
- [x] Validar la conexión desde local hacia Atlas: DNS SRV, TCP 27017 y autenticación OK; colecciones listadas.
- [ ] Verificar que la IP usada habitualmente esté en Atlas → Network Access (evitar dejar `0.0.0.0/0` de forma permanente).
- [x] Documentar procedimiento para conectar Compass (pasos y verificación) en `docs/operacion/conectar-compass.md`, sin credenciales.
- [ ] Definir mejor práctica de acceso: conexión directa por Compass vs. túnel/backup.

## 2. Revisar colección de usuarios
- [x] Auditar `backend/src/models/User.js`: **no** contiene `reviews`, `likes`, `saved`, `rating` ni `avgRating`.
- [x] Confirmar que las reseñas viven solo en la colección `reviews` (índice único `usuario+receta`); no hay duplicidad en `users`.
- [x] Eliminar `users.favoritos[]` y `stats.favoritosCount`; las interacciones viven en `likes`/`saves`.
- [x] Actualizar `docs/modelo-datos/usuario.md` con la decisión tomada.

## 3. Normalizar la colección `recipes`
Problema: `recipes` mezclaba el contenido de la receta con relaciones hacia usuarios.
- [x] Mantener como caché derivada: `likesCount`, `guardadosCount`, `comentariosCount`, `compartidosCount`, `ratingPromedio`, `ratingCount`.
- [x] Mover `likes[]` a colección propia `likes` con índice único `(usuario, receta)` (mismo patrón que `reviews` y `follows`).
- [x] Mover `guardados[]` a colección propia `saves` con índice único `(usuario, receta)`.
- [x] Mover `reportes[]` a colección propia `reports` con estado (`pendiente`/`descartado`/`resuelto`); eliminado `reportado`.
- [x] Eliminar el booleano global `favorito` de `Recipe`; el "Guardar" (`saves`) es el único favorito personal.
- [x] Añadir índices a `recipes`: `{usuario:1, createdAt:-1}`, `{categoria:1}`, `{publica:1}`.
- [x] Actualizar `recipeSocialController.js`, `recipeController.js` (flags `liked`/`saved`) y `dashboard.ts`/`dashboard.html` (filtro por `saved`, sin estrella).
- [ ] Migrar los datos existentes con `backend/scripts/normalize-interactions.js` **después** de desplegar el backend nuevo (~5 likes, ~5 guardados, 0 reportes).
- [x] Actualizar `docs/modelo-datos/` (receta, usuario, like, guardado, reporte) y los dos DERCAS (diagrama ER, procesos, casos de uso, estados).

## 4. Pruebas con Postman
- [ ] Crear un **Environment** en Postman (fuera del repo) con variables: `baseUrl`, `token`, `userId`, etc.
- [ ] Configurar colección existente (`postman/Recetario.postman_collection.json`) para usar variables de entorno.
- [ ] Añadir requests para flujos críticos: auth, recetas, imágenes, likes/saves, comentarios, reseñas, follows, feed.
- [ ] Guardar scripts de pre-request/test para obtener token automáticamente si aplica.
- [ ] Documentar cómo importar colección + environment en `docs/operacion/` o README de Postman.
- [ ] Ejecutar pruebas end-to-end y registrar resultados en bitácora.

## 5. Seguridad: rotación de credenciales
La cadena `MONGODB_URI` y `JWT_SECRET` estuvieron en `docker-compose.yml` (ya corregido a `env_file`), por lo que siguen en el historial de git.
- [x] Quitar credenciales de `docker-compose.yml` (usar `env_file: ./backend/.env`); aplicado también en la VPS.
- [x] Quitar credenciales de `docs/operacion/conectar-compass.md`.
- [x] `backend/.env` en la VPS ya existía con `MONGODB_URI`, `JWT_SECRET`, `PORT`; verificado y sigue intacto.
- [x] Crear `backend/.dockerignore` (evita que `COPY . .` incruste el `.env` en la imagen); aplicado en local y VPS.
- [ ] **Rotar la clave del usuario de Atlas** (Atlas → Database Access) para invalidar el historial.
- [ ] Rotar `JWT_SECRET` en `backend/.env` (local y VPS); invalida sesiones activas.
- [ ] Confirmar que `.env` sigue ignorado por git en todos los entornos.

## Prioridad
Orden sugerido: primero seguridad/rotación de credenciales; luego normalización de `recipes`; después Postman. Conexión a Atlas (1) y revisión de usuarios (2) ya documentadas.
