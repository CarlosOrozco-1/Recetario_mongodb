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
- [x] Migrar los datos existentes con `backend/scripts/normalize-interactions.js` (2026-10-17): dry-run previo 5/5/0, aplicada en la VPS tras desplegar el backend nuevo; sin campos viejos en `recipes`/`users`; índices únicos `(usuario, receta)` creados. Idempotente (re-ejecución → 0/0/0).
- [x] Actualizar `docs/modelo-datos/` (receta, usuario, like, guardado, reporte) y los dos DERCAS (diagrama ER, procesos, casos de uso, estados).

## 4. Pruebas con Postman
- [x] Crear colecciones por entorno con variables de colección (`baseUrl`, `token`, `userId`, etc.): `postman/Recetario-Local.postman_collection.json` y `postman/Recetario-Remoto.postman_collection.json`. Environment de Postman quedó opcional.
- [x] Configurar las colecciones para usar variables (`{{baseUrl}}`, `{{token}}`, …); las IDs se guardan automáticamente desde las respuestas.
- [x] Añadir requests para flujos críticos: auth, recetas, imágenes, likes/saves, comentarios, reseñas, follows, activity (8 carpetas).
- [x] Guardar scripts de test para obtener token e IDs automáticamente desde las respuestas.
- [x] Documentar importación y uso en `docs/operacion/postman-environment.md` y enlace desde el README raíz.
- [x] Ejecutar pruebas end-to-end contra el remoto y registrar resultados en bitácora. 2026-10-17: **28/28 PASS** (dos ejecuciones: la primera detectó el 500 de `POST /follows`, defecto corregido, desplegado y reejecutado sin fallos). Cubre auth, CRUD de recetas, imágenes GridFS, likes/saves/share/report con reglas de negocio, flags `liked`/`saved`, comentarios, reseñas, follows, actividad y DELETE con cascada.

## 5. Seguridad: rotación de credenciales
La cadena `MONGODB_URI` y `JWT_SECRET` estuvieron en `docker-compose.yml` (ya corregido a `env_file`), por lo que siguen en el historial de git.
- [x] Quitar credenciales de `docker-compose.yml` (usar `env_file: ./backend/.env`); aplicado también en la VPS.
- [x] Quitar credenciales de `docs/operacion/conectar-compass.md`.
- [x] `backend/.env` en la VPS ya existía con `MONGODB_URI`, `JWT_SECRET`, `PORT`; verificado y sigue intacto.
- [x] Crear `backend/.dockerignore` (evita que `COPY . .` incruste el `.env` en la imagen); aplicado en local y VPS.
- [ ] **Rotar la clave del usuario de Atlas** (Atlas → Database Access) para invalidar el historial.
- [ ] Rotar `JWT_SECRET` en `backend/.env` (local y VPS); invalida sesiones activas.
- [ ] Confirmar que `.env` sigue ignorado por git en todos los entornos.

### 5.1 Llave SSH filtrada en el historial
El commit `c6eee0c` subió `carloso` (llave privada OpenSSH) y `carloso.pub`, usados para la conexión con el remoto. Ya no están en el árbol actual, pero **permanecen en el historial de GitHub**.
- [ ] Rotar/cambiar la llave SSH del repositorio remoto para invalidar la filtrada. Decisión: se conserva por ahora, se rotará posteriormente.
- [ ] Opcional: purgar el historial (`git filter-repo`/`git filter-branch`) y exige force-push + re-clonar en el otro equipo.

## 6. Instrucciones de preparación por pasos
- [x] Capturar, editar y numerar instrucciones paso a paso en el formulario de recetas.
- [x] Mostrar las instrucciones como lista en el detalle, conservando compatibilidad con textos históricos y el campo API `instrucciones`.
- [x] Actualizar documentación de modelo y DERCAS; validar tests y build.

## Prioridad
Orden sugerido: seguridad/rotación de credenciales (incluida la llave SSH filtrada) — pendientes prioritarios. Las pruebas E2E contra el remoto quedaron en 28/28 PASS (2026-10-17) y la migración de `recipes` ya se aplicó en Atlas (5 likes / 5 saves / 0 reportes). Conexión a Atlas (1), revisión de usuarios (2), flujo local contenerizado y colecciones Postman (4) ya documentados.
