# 📋 Plan de Aprendizaje Stack MEAN - Registro de Fases

**Proyecto:** Recetario Personal
**Sistema:** Arch Linux (Omarchy)
**Entorno:** Docker + Docker Compose
**Ruta del proyecto:** `/home/carloso/Projects/2026/MAIN/recetario`

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

### Paso 28 - Validaciones y Manejo de Errores
- [ ] Validaciones en backend (campos obligatorios)
- [ ] Mensajes de error en frontend
- [ ] Toast/alertas de éxito

---

## 🚀 Fase 4 - Finalización

### Paso 29 - Optimizaciones
- [ ] Paginación de recetas
- [ ] Búsqueda por título
- [ ] Filtros por categoría

### Paso 30 - Seguridad
- [ ] Rate limiting en endpoints
- [ ] Validación de ObjectId en rutas
- [ ] Sanitización de inputs

### Paso 31 - Documentación
- [ ] Actualizar README.md con instrucciones
- [ ] Documentar endpoints de la API
- [ ] Capturas de pantalla del funcionamiento

### Paso 32 - Deploy (Opcional)
- [ ] Configurar para producción
- [ ] Variables de entorno seguras
- [ ] Imágenes Docker optimizadas

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

### Paso 37 - Frontend: Visualización
- [x] En modal detalle y card: `<img [src]="'/api/recipes/image/' + recipe.imagen" />`
- [x] Fallback a placeholder SVG si no hay imagen
- [x] Lazy loading (`loading="lazy"`)

### Paso 38 - Limpieza y Validaciones
- [ ] Eliminar imagen GridFS al borrar receta (cascade)
- [ ] Validar tamaño máx (ej. 5MB) y dimensiones
- [ ] Opcional: redimensionar en servidor (sharp)

---

## 🌐 Fase 6 - Red Social de Recetas (Refactoring)

**Objetivo:** Transformar el recetario personal en una red social completa para compartir, descubrir y valorar recetas.

### Paso 39 - Modelo de Datos Social
- [ ] Extender `User`: bio, avatar, seguidores/seguidos, recetas favoritas, stats
- [ ] Extender `Recipe`: likes, saves, shares, comments[], rating promedio, visibilidad
- [ ] Nuevo modelo `Comment`: user, recipe, texto, fecha, respuestas (threaded)
- [ ] Nuevo modelo `Review`: user, recipe, rating (1-5), texto, fecha
- [ ] Nuevo modelo `ActivityFeed`: user, tipo (creó, comentó, puntuó, compartió, siguió), ref, fecha

### Paso 40 - Backend: Endpoints Sociales
- [ ] `POST/GET /api/recipes/:id/comments` - comentarios en receta
- [ ] `POST /api/recipes/:id/reviews` - reseña con puntuación
- [ ] `POST /api/recipes/:id/like` - toggle like
- [ ] `POST /api/recipes/:id/save` - toggle guardar (bookmark)
- [ ] `POST /api/users/:id/follow` - seguir/dejar de seguir
- [ ] `GET /api/users/:id/profile` - perfil público con stats
- [ ] `GET /api/feed` - feed personalizado (recetas de seguidos + recomendadas)
- [ ] `GET /api/search` - búsqueda global (recetas, usuarios, hashtags)

### Paso 41 - Frontend: Componentes Sociales
- [ ] Perfil de usuario (`/profile/:username`)
- [ ] Feed principal (`/feed`) con infinite scroll
- [ ] Detalle receta con: comments thread, reviews, rating stars, share button
- [ ] Modal de comentario/respuesta
- [ ] Componente rating stars (lectura/escritura)
- [ ] Notificaciones (campana) - likes, comments, follows

### Paso 42 - UX/UI Social
- [ ] Cards de receta con: autor, rating, likes, saves, comments count
- [ ] Avatar + username en todas las cards
- [ ] Botones: like (♥), save (🔖), share (🔗), comment (💬)
- [ ] Hashtags en descripción (#postre #facil)
- [ ] Estados vacíos amigables ("Sigue chefs para ver su contenido")

### Paso 43 - Validaciones y Moderación
- [ ] Reportar receta/comentario/usuario
- [ ] Soft delete en contenido reportado
- [ ] Rate limiting estricto en acciones sociales
- [ ] Sanitización XSS en comentarios/biografías

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
