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
- [x] Guardar cada instrucción como subdocumento `{ orden, texto }`; el servidor renumera y descarta vacíos.
- [x] Mostrar las instrucciones como lista en el detalle, conservando compatibilidad con textos históricos.
- [x] Actualizar documentación de modelo y DERCAS; validar tests y build.
- [ ] Datos existentes: ver pendiente 10 (migración y verificación).

## 7. Listado después de guardar o crear una receta
- [x] Revisar la respuesta del API, la navegación y la carga del tablero: el backend devuelve correctamente la lista tras crear.
- [x] Añadir recarga automática del tablero al volver a `/dashboard` y pruebas de build.
- [ ] Verificar en el navegador que el listado aparece tras guardar y crear.

## 8. Feed de recetas con “Me gusta”
- [x] Añadir una pestaña “Me gusta” en el dashboard que consulta `GET /api/recipes?scope=liked`.
- [x] Endpoint backend con filtrado por likes del usuario y flags `liked`/`saved`.
- [x] Documentar el parámetro `scope=liked` en la API.
- [ ] Confirmar acceso autorizado y estados de carga, vacío y error en navegador.

## 9. Acceso con Google
Estado: implementación avanzada en backend y frontend; pendiente de corregir la configuración y validar el flujo completo.
- [x] Endpoint `POST /api/auth/google` con verificación de firma, audiencia y `email_verified` (`f304806`).
- [x] Botón de Google y carga del script de identidad en el login (`1b02056`).
- [x] Pruebas del endpoint: configuración faltante, credencial ausente o sobredimensionada, email no verificado, alta y vinculación de cuentas.
- [x] Corregir la comilla sobrante en `GOOGLE_CLIENT_ID` de `local/compose.yaml` y documentar la causa (2026-11-03).
- [x] Quitar el `client_id` del código del frontend: `GET /api/config` entrega la configuración pública al login.
- [ ] Definir `GOOGLE_CLIENT_ID` en el `.env` del backend para ejecución local sin compose y en la VPS.
- [ ] Probar éxito, cancelación y errores de credencial/configuración sin exponer tokens ni identificadores sensibles.
- [ ] Registrar el resultado en la bitácora.

## 10. Corregir las instrucciones ya guardadas en la base de datos
El código nuevo ya escribe `instrucciones` como arreglo de subdocumentos, pero los documentos existentes todavía conservan el bloque de texto anterior. Al consultarlos en Atlas o Compass se ve una sola cadena.
- [x] El modelo, el formulario y el API guardan y devuelven arreglos `{ orden, texto }` en altas y ediciones.
- [x] El script de migración detecta texto en bloque, arreglos híbridos y pasos escritos en una sola línea; incluye modo `--check`.
- [ ] Ejecutar `node scripts/normalize-instructions.js --dry-run` en `backend/` contra Atlas y revisar cuántas recetas y pasos se migrarían.
- [ ] Aplicar la migración contra Atlas con `node scripts/normalize-instructions.js` y verificar con `--check` que no queden cadenas.
- [x] Ejecutar el dry-run en la base local: 12 recetas, 44 pasos (2026-11-03).
- [x] Aplicar la migración en `recetario_local` y verificar con `--check`: 0 cadenas, 12 recetas con arreglo, 44 pasos y sin `_id` en los subdocumentos (2026-11-03).
- [ ] Confirmar en una consulta de Atlas que un documento de ejemplo muestra `instrucciones` como arreglo de subdocumentos.
- [ ] Registrar el resultado de Atlas en la bitácora.

## Registro de avances
- 2026-11-03: pendiente 6 implementado en código y documentación; falta ejecutar la migración en local y Atlas. Pendientes 7–9 abiertos.
- 2026-11-03: `pre` y `pro` actualizadas por fast-forward con `origin`; `desa` conserva dos commits locales de Google sin publicar.
- 2026-11-03: el login obtiene `googleClientId` desde `GET /api/config`; se elimina `frontend/src/environments/environment.ts` y la nota local con credenciales queda ignorada por Git.
- 2026-11-03: pendiente 10 agregado. El script de migración ahora separa pasos en una sola línea, normaliza arreglos híbridos y permite verificar con `--check`.
- 2026-11-03: migración aplicada en la base local `recetario_local`: 12 recetas, 44 pasos, 0 cadenas restantes. En Atlas queda pendiente por falta de `MONGODB_URI`.

## Prioridad
Orden sugerido: seguridad/rotación de credenciales (incluida la llave SSH filtrada), migrar las instrucciones existentes (10), validar el acceso con Google (9), corregir el listado tras guardar (7) y añadir el feed de “Me gusta” (8). Las pruebas E2E contra el remoto quedaron en 28/28 PASS (2026-10-17) y la migración de `recipes` ya se aplicó en Atlas (5 likes / 5 saves / 0 reportes). Conexión a Atlas (1), revisión de usuarios (2), flujo local contenerizado y colecciones Postman (4) ya documentados.
