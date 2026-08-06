# 🚀 Instrucciones para Levantar los Servicios

## Requisitos

- Docker instalado
- Docker Compose instalado
- Docker en ejecución

## 🚀 Levantar todos los servicios

Desde la raíz del proyecto:

```bash
docker compose up --build
```

Esto levanta 3 contenedores:

| Servicio | Contenedor | Puerto |
|----------|-----------|--------|
| **MongoDB** | `recetario-mongo` | 27017 |
| **Backend** (Express) | `recetario-backend` | 3000 |
| **Frontend** (Angular) | `recetario-frontend` | 4200 |

## ✅ Verificar que todo funciona

1. **Health check del backend:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Respuesta esperada:
   ```json
   {
     "status": "ok",
     "mongodb": "conectado",
     "database": "recetario",
     "host": "mongo",
     "port": 27017,
     "timestamp": "..."
   }
   ```

2. **Frontend:** Abrir `http://localhost:4200` en el navegador

3. **MongoDB Compass:** Conectar a `mongodb://localhost:27017`
   - Base de datos: `recetario`
   - Colecciones: `users`, `recipes`

## 📖 Comandos útiles

### Ver logs de un servicio
```bash
docker compose logs backend
docker compose logs mongo
docker compose logs frontend
```

### Ver servicios en ejecución
```bash
docker compose ps
```

### Detener servicios
```bash
docker compose down
```

### Detener y eliminar datos de MongoDB
```bash
docker compose down -v
```

### Ejecutar comandos dentro de un contenedor
```bash
docker exec -it recetario-mongo bash
docker exec -it recetario-backend sh
```

### Verificar conexión a MongoDB desde el contenedor
```bash
docker exec recetario-mongo mongosh --eval "db.version()"
```

## 🐳 Comandos de mantenimiento

### Reconstruir desde cero
```bash
docker compose down -v
docker compose up --build
```

### Desarrollo sin Docker (Backend)
```bash
cd backend
npm install
npm run dev
```
> Requiere MongoDB local o modificar `MONGO_URI` en `backend/.env`

### Desarrollo sin Docker (Frontend)
```bash
cd frontend
npm install
npm start
```

## 🧪 Pruebas con Postman

1. Importar `postman/Recetario.postman_collection.json` en Postman
2. Ejecutar en orden:
   - `POST /api/auth/register` (crea usuario y guarda token)
   - `POST /api/auth/login` (guarda token automáticamente)
   - `POST /api/recipes` (crea receta, guarda recipeId)
   - `GET /api/recipes`
   - `GET /api/recipes/:id`
   - `PUT /api/recipes/:id`
   - `DELETE /api/recipes/:id`

> Las variables `{{token}}` y `{{recipeId}}` se llenan automáticamente.

## ⚠️ Solución de problemas

| Problema | Solución |
|----------|----------|
| Puerto 3000 en uso | Cambiar `PORT` en `backend/.env` |
| Puerto 27017 en uso | Cambiar mapeo en `docker-compose.yml` |
| Error de conexión MongoDB | Verificar que el contenedor `recetario-mongo` esté corriendo |
| Cambios no reflejados | Reconstruir: `docker compose up --build` |
