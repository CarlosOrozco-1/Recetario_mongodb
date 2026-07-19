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

## ⏳ Próximos pasos
- [ ] Paso 6 - Crear punto de entrada del backend (server.js)
- [ ] Paso 7 - Archivo .env
- [ ] Paso 8 - Dockerfile del frontend
- [ ] Paso 9 - Inicializar proyecto Angular
- [ ] Paso 10 - Configurar proxy Angular
- [ ] Paso 11 - Levantar todo con docker compose up
- [ ] Paso 12 - Probar entorno completo
