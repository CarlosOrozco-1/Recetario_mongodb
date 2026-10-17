# 📋 Plan de Aprendizaje Stack MEAN - Registro de Fases

**Proyecto:** Recetario Personal
**Sistema:** Arch Linux (Omarchy)
**Entorno:** Docker + Docker Compose
**Ruta del proyecto:** `/home/carloso/Projects/2026/MAIN/recetario`

---

## 🗺️ Estado General (2026-09-26)

| Fase | Tema | Estado |
|---|---|---|
| 0 | Preparación del entorno | ✅ Completada |
| 1 | Backend API | ✅ Completada |
| 2 | Frontend Angular | ✅ Completada |
| 3 | Integración y pruebas | ✅ Completada |
| 4 | Finalización | ⚠️ Parcial (deploy hecho; paginación, búsqueda y filtros no) |
| 5 | Imágenes GridFS | ✅ Completada |
| 6 | Red social | ⚠️ En curso (faltan perfil público y búsqueda) |
| 7 | Validación de notificaciones | 🚧 Pendiente (no implementado) |
| 8 | Especificación de schemas | 🚧 En curso (diagrama ER hecho) |
| 9 | Diagramas del sistema | 🚧 En curso (ER hecho; faltan flujos y casos de uso) |

### Dónde nos quedamos

El recetario funciona de punta a punta en local y está desplegado en
`https://foodloopc.duckdns.org`. Lo último fue cerrar el ciclo de imágenes
(sustituir y eliminar una imagen que ya existe) y el toggle de privacidad.

Hay dos cosas que conviene tener presentes antes de la entrega:

1. **Las notificaciones no existen.** La campana es una vista del feed, el
   contador no baja y "marcar como leída" no se guarda. Es la Fase 7.
2. **Fase 6 está marcada como completada y no lo está.** `GET /api/search` y
   `GET /api/users/:id/profile` se documentan pero nunca se implementaron.

Pruebas actuales: **14 backend** (`backend/test/recipes.test.js`) y
**11 frontend** (`frontend/test/dashboard-templates.test.js`).

### Commits locales sin subir

`desa`, `pre` y `pro` están en `cd2441d`. Lo único pendiente de `origin` es el
commit de este documento. El código de la corrección de imágenes (`33f2f9e`) y su
explicación (`5d8c37d`) ya están subidos, pero **producción aún no se ha
reconstruido** con ellos.

---

## 🐳 Fase 0 - Preparación del Entorno

### ✅ Paso 1 - Instalar Docker y Docker Compose
- Instalación: `sudo pacman -Syu docker docker-compose`
- Servicio iniciado y habilitado: `sudo systemctl enable --now docker`
- Usuario agregado al grupo docker: `sudo usermod -aG docker $USER`
- Versión verificada: `docker --version` y `docker compose version`

### ✅ Paso 2 - Crear estructura de carpetas

### ✅ Paso 3 - Crear docker-compose.yml
- Servicios: mongo (v8), backend, frontend
- Red interna entre contenedores
- Volúmenes para persistencia y desarrollo

### ✅ Paso 4 - Crear Dockerfile del backend
- Imagen base: `node:20-alpine`
- Directorio de trabajo: `/app`
- Puerto expuesto: `3000`

### ✅ Paso 5 - Inicializar package.json del backend
- `npm init -y`
- Dependencias: express, mongoose, bcryptjs, jsonwebtoken, dotenv, cors
- Dev: nodemon
- Scripts: `start` y `dev`

---

## 🔧 Fase 1 - Backend API (Node.js + Express + MongoDB)

### Paso 6 - Punto de entrada del backend (server.js)
- [x] Crear `server.js` en `backend/src/`
- [x] Configurar Express con middlewares (cors, json)
- [x] Conectar a MongoDB con Mongoose
- [x] Crear ruta de prueba `GET /api/health` (mejorada con estado de MongoDB)
- [x] Configurar puerto y iniciar servidor

### Paso 7 - Archivo de variables de entorno (.env)
- [x] Crear `.env` en `backend/`
- [x] Variables: `MONGO_URI`, `JWT_SECRET`, `PORT`
- [x] Verificar que `.gitignore` excluye `.env`

### Paso 8 - Modelo de Usuario
- [x] Crear `backend/src/models/User.js`
- [x] Schema: name, email, password, timestamps
- [x] Método pre-save para encriptar contraseña (bcrypt)
- [x] Método para verificar contraseña

### Paso 9 - Controlador de Autenticación
- [x] Crear `backend/src/controllers/authController.js`
- [x] Función `register`: crear usuario, retornar token JWT
- [x] Función `login`: validar credenciales, retornar token JWT
- [x] Generar JWT con expiración de 30 días

### Paso 10 - Rutas de Autenticación
- [x] Crear `backend/src/routes/auth.js`
- [x] `POST /api/auth/register`
- [x] `POST /api/auth/login`

### Paso 11 - Middleware de Autenticación
- [x] Crear `backend/src/middleware/auth.js`
- [x] Verificar token JWT en headers
- [x] Extraer usuario del token y adjuntar al request

### Paso 12 - Modelo de Receta
- [x] Crear `backend/src/models/Recipe.js`
- [x] Schema: titulo, descripcion, ingredientes[], instrucciones, imagen, usuario (ref)
- [x] Relación con User mediante ObjectId

### Paso 13 - Controlador de Recetas (CRUD)
- [x] Crear `backend/src/controllers/recipeController.js`
- [x] `create`: crear receta
- [x] `getAll`: listar recetas del usuario
- [x] `getById`: obtener receta por ID
- [x] `update`: actualizar receta
- [x] `delete`: eliminar receta

### Paso 14 - Rutas de Recetas
- [x] Crear `backend/src/routes/recipes.js`
- [x] Todas las rutas requieren autenticación (middleware)
- [x] `POST /api/recipes`
- [x] `GET /api/recipes`
- [x] `GET /api/recipes/:id`
- [x] `PUT /api/recipes/:id`
- [x] `DELETE /api/recipes/:id`

### Paso 15 - Probar Backend con Postman/Compass
- [x] Importar colección Postman (`Recetario.postman_collection.json`)
- [x] Probar health check
- [x] Probar registro de usuario
- [x] Probar login
- [x] Probar CRUD de recetas
- [x] Verificar datos en MongoDB Compass

---

## 🎨 Fase 2 - Frontend (Angular)

### Paso 16 - Dockerfile del frontend
- [x] Crear `frontend/Dockerfile`
- [x] Imagen base: `node:20-alpine`
- [x] Instalar dependencias y exponer puerto 4200

### Paso 17 - Inicializar proyecto Angular
- [x] Crear proyecto con `ng new frontend --standalone`
- [x] Configurar proxy para conectar al backend
- [x] Verificar que `ng serve` funciona

### Paso 18 - Servicio de Autenticación
- [x] Crear `src/app/services/auth.service.ts`
- [x] Métodos: login, register, logout, getToken, isLoggedIn
- [x] Guardar token en localStorage

### Paso 19 - Guard de Autenticación
- [x] Crear `src/app/guards/auth.guard.ts`
- [x] Proteger rutas que requieren login
- [x] Redirigir a login si no hay token

### Paso 20 - Componente de Login
- [x] Crear `src/app/components/login/`
- [x] Formulario con email y contraseña
- [x] Llamar a AuthService.login()
- [x] Redirigir a dashboard al iniciar sesión

### Paso 21 - Componente de Registro
- [x] Crear `src/app/components/register/`
- [x] Formulario con nombre, email, contraseña
- [x] Llamar a AuthService.register()

### Paso 22 - Servicio de Recetas
- [x] Crear `src/app/services/recipe.service.ts`
- [x] CRUD completo: create, getAll, getById, update, delete
- [x] Enviar token en headers Authorization

### Paso 23 - Componente Dashboard (Lista de Recetas)
- [x] Crear `src/app/components/dashboard/`
- [x] Listar recetas del usuario
- [x] Botón para crear nueva receta
- [x] Opciones de editar/eliminar

### Paso 24 - Componente Formulario Receta
- [x] Crear `src/app/components/recipe-form/`
- [x] Formulario para crear/editar receta
- [x] Campos: titulo, descripcion, ingredientes, instrucciones

### Paso 25 - Rutas del Frontend
- [x] Configurar `app.routes.ts`
- [x] `/login` → LoginComponent
- [x] `/register` → RegisterComponent
- [x] `/dashboard` → DashboardComponent (protegida)
- [x] `/recipes/new` → RecipeFormComponent (protegida)
- [x] `/recipes/:id/edit` → RecipeFormComponent (protegida)

---

## 🔗 Fase 3 - Integración y Pruebas

### Paso 26 - Levantar el entorno completo
- [x] `docker compose up --build`
- [x] Verificar los 3 contenedores corriendo
- [x] Verificar conexión a MongoDB

### Paso 27 - Pruebas de integración
- [x] Registrar usuario desde Angular
- [x] Iniciar sesión
- [x] Crear receta
- [x] Listar recetas
- [x] Editar receta
- [x] Eliminar receta
- [x] Verificar persistencia en MongoDB
- [ ] Preparar MongoDB local aislado para pruebas rápidas de API, sin conexión a Atlas
- [ ] Probar todos los flujos/endpoints contra la base local antes de validar persistencia en Atlas
- [ ] Documentar el procedimiento para promover datos aprobados a Atlas (sin copiar datos de prueba automáticamente)

### Paso 28 - Validaciones y Manejo de Errores
- [x] Validaciones en backend (campos obligatorios)
- [x] Mensajes de error en frontend
- [x] Toast/alertas de éxito
- [ ] Validación de ObjectId en todas las rutas (hoy Mongoose lanza `CastError` en vez de 400)
- [ ] Saneado global de inputs (hoy `sanitizeFields` se aplica ruta a ruta)
- [ ] `app.set("trust proxy", 1)` para que el rate limit vea la IP real detrás de Caddy
- [ ] `uploadLimiter` definido en `rateLimiter.js` pero no aplicado a la subida de imágenes

---

## 🚀 Fase 4 - Finalización

### Paso 29 - Optimizaciones
- [x] Paginación en el feed (`?page`/`?limit` en `GET /api/activity/feed`)
- [ ] Paginación en el listado de recetas del dashboard (hoy solo `.sort({ createdAt: -1 })`)
- [ ] Búsqueda por título
- [ ] Filtros por categoría

### Paso 30 - Seguridad
- [x] Rate limiting en endpoints (`apiLimiter`, `authLimiter`, `socialLimiter`, `createLimiter`)
- [x] Sanitización de inputs (`sanitizeFields` en comentarios, reseñas, reports y recetas)
- [ ] Validación de ObjectId en rutas
- [ ] Aplicar `uploadLimiter` a `POST /api/recipes/:id/image`
- [ ] Rotar secretos y sacarlos del historial de `docker-compose.yml`

### Paso 31 - Documentación
- [x] Actualizar README.md con instrucciones
- [x] Documentar endpoints de la API (tabla en README)
- [ ] Capturas de pantalla del funcionamiento
- [ ] Documentar la estructura de los schemas (ver Fase 8)
- [ ] Diagramas de flujo y casos de uso al día (ver Fase 8)

### Paso 32 - Deploy
- [x] Configurar para producción (VPS con Caddy + Docker Compose)
- [x] Imágenes Docker optimizadas (build multi-stage + nginx)
- [ ] Variables de entorno seguras (secretos aún en texto plano en compose/historial)
- [ ] `.dockerignore` en `backend/`

---

## 🖼️ Fase 5 - Imágenes de Recetas (GridFS - MongoDB Nativo)

### Paso 33 - Configuración GridFS + Multer
- [x] Instalar `multer-gridfs-storage` en backend
- [x] Crear middleware `upload.js` con GridFSStorage (bucket "uploads")
- [x] Configurar límite de tamaño y tipos MIME permitidos (image/*)

### Paso 34 - Endpoint Subida de Imagen
- [x] `POST /api/recipes/:id/image` (protegido, solo dueño)
- [x] Recibe `multipart/form-data` con campo `imagen`
- [x] Guarda `file.id` (ObjectId de GridFS) en `recipe.imagen`
- [x] Retorna receta actualizada

### Paso 35 - Endpoint Servir Imagen
- [x] `GET /api/recipes/image/:fileId`
- [x] Stream directo desde GridFSBucket → response
- [x] Headers: Content-Type, Cache-Control

### Paso 36 - Frontend: Subida en Formulario
- [x] Input `<input type="file" accept="image/*">` en recipe-form
- [x] Preview antes de subir
- [x] Botón "Subir imagen" llama a `RecipeService.uploadImage(id, file)`
- [x] Toast éxito/error
- [x] Permitir **sustituir** una imagen que ya existe (el botón se ocultaba con
      `*ngIf="selectedFile && !recipe.imagen"`, así que solo se podía subir la primera)
- [x] Redimensionar en el navegador con `canvas` (lado mayor 1600 px, JPEG 0.8)

### Paso 37 - Frontend: Visualización
- [x] En modal detalle y card: `<img [src]="'/api/recipes/image/' + recipe.imagen" />`
- [x] Fallback a placeholder SVG si no hay imagen
- [x] Lazy loading (`loading="lazy"`)

### Paso 38 - Limpieza y Validaciones
- [x] Eliminar imagen GridFS al borrar receta (cascade)
- [x] Validar tamaño máx 5 MB y MIME permitido
- [x] Borrar la imagen anterior al sustituir o quitar la imagen de una receta
- [x] Endpoint de imagen público solo para poder usar `<img src>` sin montar
      un Authorization header en cada etiqueta
- [x] `Content-Type` desde los metadatos de GridFS + `Cache-Control: immutable`
- [ ] Validar los bytes reales del fichero (magic bytes), no solo el MIME declarado
- [x] ~~Redimensionar en servidor (sharp)~~: descartado a propósito. Se hace en el
      navegador y el servidor no necesita `sharp`; medido 2,4 MB → 186 KB

---

## 🌐 Fase 6 - Red Social de Recetas (Refactoring) ⚠️ EN CURSO

**Objetivo:** Transformar el recetario personal en una red social completa para compartir, descubrir y valorar recetas.

> **Nota de estado (2026-09-26):** la fase se habia marcado como completada, pero al
> contrastar el documento con lo realmente montado en `server.js` hay endpoints
> que **no existen**. Se corrige el estado a "en curso".

| Documentado como hecho | Realidad |
|---|---|
| `GET /api/users/:id/profile` | ❌ no existe `routes/users.js` |
| `GET /api/search` | ❌ no existe `routes/search.js` |
| `GET /api/feed` | ⚠️ existe como `GET /api/activity/feed` |
| `POST /api/recipes/:id/comments` | ⚠️ existe como `POST /api/comments` (body con `recetaId`) |
| `POST /api/recipes/:id/reviews` | ⚠️ existe como `POST /api/reviews` (body con `recetaId`) |
| `POST /api/users/:id/follow` | ⚠️ existe como `POST /api/follows` (body con `seguidoId`) |

El frontend llama a las rutas que sí existen, así que la app funciona; lo que
queda desfasado es la documentación de la API y las dos funcionalidades ausentes.

### Paso 39 - Modelo de Datos Social ✅
- [x] Extender `User`: bio, avatar, seguidores/seguidos, recetas favoritas, stats
- [x] Extender `Recipe`: likes, saves, shares, comments[], rating promedio, visibilidad
- [x] Nuevo modelo `Comment`: user, recipe, texto, fecha, respuestas (threaded)
- [x] Nuevo modelo `Review`: user, recipe, rating (1-5), texto, fecha
- [x] Nuevo modelo `ActivityFeed`: user, tipo, ref, metadata, fecha
- [ ] Respuestas anidadas a comentarios: el modelo contempla `respuestas[]` pero
      `comments.js` solo expone listar/crear/editar/borrar en primer nivel

### Paso 40 - Backend: Endpoints Sociales ⚠️ PARCIAL
- [x] `POST /api/comments` + `GET /api/comments/receta/:recetaId`
- [x] `POST /api/reviews` + `GET /api/reviews/receta/:recetaId`
- [x] `POST /api/recipes/:id/like` - toggle like
- [x] `POST /api/recipes/:id/save` - toggle guardar (bookmark)
- [x] `POST /api/recipes/:id/share` - incrementar share
- [x] `POST /api/follows` - seguir/dejar de seguir
- [x] `GET /api/activity/feed` - feed con paginación
- [x] `GET /api/follows/followers/:userId` y `/following/:userId`
- [ ] `GET /api/users/:id/profile` - perfil público con stats (**no implementado**)
- [ ] `GET /api/search` - búsqueda global de recetas, usuarios y hashtags (**no implementado**)
- [ ] Registrar `compartio_receta` en `ActivityFeed` al compartir
- [ ] Reglas de servidor: no darse like a la propia receta ni responderse a uno mismo
- [ ] Recalcular la valoración promedio al crear/eliminar una reseña

### Paso 41 - Frontend: Componentes Sociales ✅
- [x] Perfil de usuario (`/profile/:username`)
- [x] Feed principal (`/feed`) con paginación
- [x] Detalle receta con comentarios, reseñas, rating stars y botón compartir
- [x] Modal de comentario
- [x] Componente rating stars (lectura/escritura)
- [x] Campana de notificaciones (construida sobre `ActivityFeed`, ver Fase 7)
- [ ] El perfil se monta con `getUserActivity(username)`, que recibe un id de
      usuario: falta resolver `username` → `_id` en el backend

### Paso 42 - UX/UI Social ✅
- [x] Cards de receta con autor, rating, likes, saves y comments count
- [x] Avatar + username en todas las cards
- [x] Botones: like (♥), save (🔖), share (🔗), comment (💬)
- [x] Hashtags en descripción
- [x] Estados vacíos amigables ("Sigue chefs para ver su contenido")
- [x] Toggle de privacidad pública/privada en tarjeta y en el detalle

### Paso 43 - Validaciones y Moderación ✅
- [x] Reportar receta/comentario
- [x] Rate limiting en acciones sociales
- [x] Sanitización XSS en comentarios y biografías

---

## 🔔 Fase 7 - Validación de las Notificaciones 🆕 🚧 EN CURSO

**Estado actual: NO implementado.** La campana aparenta funcionar, pero es una
capa de `ActivityFeed`, no notificaciones. `notifications.ts` pide
`GET /api/activity/feed`, descarta las actividades propias y **marca todo como
no leído**:

```ts
this.unreadCount.set(filtered.length); // Simplificado: todas son no leídas
markAsRead(): void {
  // TODO: Implementar marcar como leída en backend
```

Problemas que arrastra:

| Síntoma | Causa |
|---|---|
| El contador no baja al abrir la campana | No hay no leídas reales: cuenta la longitud de la lista |
| "Marcar como leída" no se queda | Solo borra el elemento del array del navegador |
| Al recargar vuelve todo como no leído | No hay nada persistido |
| Se mezclan actividades que no te van dirigidas | El feed trae acciones de terceros, no de ti |
| No distingue tipos relevantes | Un `likio_receta` y un `siguio_usuario` se tratan igual |

### Paso 44 - Modelo de datos
- [ ] Crear `backend/src/models/Notification.js`:
      `destinatario` (ref User), `actor` (ref User), `tipo`
      (`like`/`comment`/`reply`/`follow`/`review`/`share`), `recurso` (ref),
      `metadata`, `leida` (bool), `timestamps`
- [ ] Índice `{ destinatario: 1, leida: 1, createdAt: -1 }`
- [ ] Invariante: nunca generar una notificación dirigida a uno mismo
- [ ] Evitar duplicados: una sola notificación por (destinatario, actor, tipo, recurso)

### Paso 45 - Backend de notificaciones
- [ ] `GET /api/notifications` con paginación y contador de no leídas en la misma respuesta
- [ ] `PUT /api/notifications/:id/read`
- [ ] `PUT /api/notifications/read-all`
- [ ] `DELETE /api/notifications/:id`
- [ ] Emitir desde las acciones reales: like, save, comentario, respuesta, reseña, follow, share
- [ ] Montar `app.use("/api/notifications", notificationsRouter)` en `server.js`

### Paso 46 - Frontend de notificaciones
- [ ] Añadir `getNotifications()`, `markAsRead()`, `markAllAsRead()` a `SocialService`
- [ ] Sustituir la lectura de `ActivityFeed` por el endpoint real
- [ ] `unreadCount` como `signal` alimentado por el servidor, no por `length`
- [ ] Resolver el `TODO` de `markAsRead()` con una petición real
- [ ] Marcar al abrir la receta desde la notificación, y al hacer clic
- [ ] Estados de carga, vacío y error (hay una vista `error` declarada sin usar)
- [ ] Tests de plantilla: que no queden `TODO` sin resolver

### Paso 47 - Validación de las notificaciones
- [ ] Casos de prueba del backend: creación al dar like, al comentar, al seguir
- [ ] No se notifica a uno mismo
- [ ] Un like, y luego un unlike, no dejan la notificación colgada
- [ ] Solo el destinatario puede marcar o borrar su notificación (403 al resto)
- [ ] El contador coincide con el número real de no leídas tras paginar
- [ ] Recargar la página conserva el estado leído/no leído
- [ ] Verificar en el navegador que el contador no miente tras marcar leídas

---

## 🏗️ Fase 8 - Especificación de Schemas ✅ COMPLETADA

**Estado actual: especificaciones creadas en `docs/modelo-datos/`.** Los schemas
se escribieron sin documento de referencia, así que la estructura se dedujo del
código. El **diagrama ER ya existe** (`docs/diagramas/diagrama-er.md`), con las
relaciones, índices y enumeraciones de las 6 colecciones implementadas y GridFS.
La especificación propuesta de notificaciones solo describe el modelo necesario
para la Fase 7.

### Paso 48 - Especificación de `User`
- [x] Extraer los campos reales de `models/User.js` a `docs/modelo-datos/usuario.md`
- [x] Tipo, obligatoriedad, valores por defecto y `maxlength` de cada campo
- [x] Relaciones (`favoritos`) y su `ref`
- [x] Índices
- [x] Ejemplo de documento JSON de ejemplo

### Paso 49 - Especificación de `Recipe`
- [x] Extraer los campos reales de `models/Recipe.js` a `docs/modelo-datos/receta.md`
- [x] Subdocumentos (`ingredientes`, `likes[]`, `guardados[]`)
- [x] Campos contadores derivados (`likesCount`, `guardadosCount`, `comentariosCount`, `ratingPromedio`, `ratingCount`, `compartidosCount`)
- [x] `visibilidad` (`publica`/`privada`) y su efecto en las consultas
- [x] Relación con GridFS documentada: `imagen` es un `String` con el `_id` de
      `uploads.files` (no un `ObjectId`), en `docs/diagramas/diagrama-er.md`

### Paso 50 - Especificación del resto de modelos
- [x] `Comment` en `docs/modelo-datos/comentario.md`, incluidas las respuestas anidadas pendientes
- [x] `Review` en `docs/modelo-datos/resena.md`, con rango 1-5 y su efecto en la valoración
- [x] `Follow` en `docs/modelo-datos/seguimiento.md`, con unicidad de la pareja `seguidor`/`seguido`
- [x] `ActivityFeed` en `docs/modelo-datos/actividad-feed.md`, con tipos admitidos y `metadata`
- [x] Especificación propuesta de `Notification` en `docs/modelo-datos/notificacion.md`, pendiente de implementar en la Fase 7
- [x] Colecciones de GridFS en `docs/modelo-datos/gridfs-e-indices.md`, con `uploads.files` y `uploads.chunks`

### Paso 51 - Consistencia
- [x] Tabla de colecciones y modelos en `docs/diagramas/diagrama-er.md`
- [x] Diagrama ER de las colecciones con relaciones, cardinalidades, índices y enumeraciones
- [x] Relaciones no impuestas documentadas: borrar una receta no elimina comentarios, reseñas ni actividad asociada.
- [ ] Revisar que el documento no contradiga el código tras cada cambio de schema

---

## 🖼️ Fase 9 - Diagramas del Sistema 🚧 EN CURSO

**Estado actual: procesos implementados documentados.** Los diagramas de flujo y
casos de uso por proceso están en `docs/diagramas/flujo/` y
`docs/diagramas/casos-uso/`, con rutas y defectos reales. Quedan pendientes el
despliegue detallado como proceso independiente y los procesos no implementados.

### Paso 52 - Diagramas de flujo por proceso
- [x] Autenticación: registro, inicio de sesión y cierre local de sesión
- [x] CRUD de recetas con lista de campos editables, propiedad y visibilidad
- [x] Ciclo de vida de la imagen: seleccionar, redimensionar, subir, guardar y servir
- [x] Sustitución y eliminación de imagen, con limpieza de GridFS
- [x] Like, save, share y reportar, con defecto conocido de compartir
- [x] Seguir, dejar de seguir, seguidores y seguidos
- [x] Comentar, responder en primer nivel y reseñar
- [x] Feed con paginación y campana provisional
- [x] Perfil actual con defecto conocido de resolución por nombre de usuario
- [ ] Despliegue detallado como proceso operativo independiente
- [ ] Búsqueda global y perfil público cuando se implementen

### Paso 53 - Diagrama de casos de uso general
- [x] Actor **Usuario registrado**
- [x] Actor **Visitante**
- [x] Actor **Propietario**
- [x] Sistema de almacenamiento externo: Atlas y GridFS
- [ ] Actor **Administrador**, solamente si se implementa moderación
- [ ] Relaciones `<<include>>` y `<<extend>>` en la versión UML formal del DERCAS
- [x] Casos de uso con rutas reales en `docs/diagramas/casos-uso/`

### Paso 54 - Diagrama de flujo general del sistema
- [x] Diagrama de flujo general con proxy local, Caddy, Express, middleware, controlador, MongoDB y GridFS
- [x] Decisiones: ruta protegida, token válido, receta pública y propiedad
- [x] Rutas de error con códigos reales, incluidos `400`, `401`, `404`, `429` y `500`
- [x] Ramas especiales: subida `multipart`, imagen pública, límites y defectos conocidos
- [x] Diagramas divididos por proceso para conservar la legibilidad

### Paso 55 - Cierre de la documentación gráfica
- [x] Revisar `docs/diagramas/README.md` como índice
- [x] Separar diagramas por proceso en `docs/diagramas/flujo/` y `docs/diagramas/casos-uso/`
- [ ] Validar automáticamente la sintaxis Mermaid de todos los diagramas
- [x] Corregir las tablas con rutas reales
- [ ] Capturas de pantalla del funcionamiento (pendiente del Paso 31)

---

## 📚 Conceptos Clave MongoDB (Referencia)

| Concepto | SQL | MongoDB |
|----------|-----|---------|
| Tabla | `CREATE TABLE` | Colección (se crea automáticamente) |
| Fila | Registro | Documento |
| Columna | Campo | Campo del Schema |
| Relación | `FOREIGN KEY` | `ObjectId` con `ref` |
| Consulta | `SELECT * FROM users` | `User.find()` |
| Insertar | `INSERT INTO users` | `User.create()` |
| Actualizar | `UPDATE users SET...` | `User.updateOne()` |
| Eliminar | `DELETE FROM users` | `User.deleteOne()` |

---

## ✅ Checklist de Aprendizaje

- [ ] Entiendo cómo MongoDB almacena documentos
- [ ] Sé crear Schemas con Mongoose
- [ ] Puedo hacer CRUD completo con Express
- [ ] Entiendo la autenticación JWT
- [ ] Sé conectar Angular con una API REST
- [ ] Puedo usar Compass para inspeccionar datos
- [ ] Entiendo el flujo completo MEAN
