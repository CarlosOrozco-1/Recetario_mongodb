# 🚀 Instrucciones para Levantar los Servicios

## Requisitos

- Docker instalado
- Docker Compose instalado
- Docker en ejecución

## ⚠️ Dos escenarios: VPS y local

El `docker-compose.yml` de la raíz es **solo para la VPS**. Depende de la red
externa `caddy-central_default`, que crea el proyecto Caddy central en el
servidor. En local esa red no existe, así que `docker compose up` falla con:

> network caddy-central_default declared as external, but could not be found

Además, Caddy es quien enruta `/api/*` al backend; sin Caddy, el nginx del
frontend no sabe a quién pedirle la API. Para local hay dos vías.

### Vía A (recomendada): desarrollo sin Docker

Dos terminales. La base de datos es el clúster de Atlas definido en
`backend/.env`.

```bash
# Terminal 1 - backend en http://localhost:3000
cd backend && npm install && npm run dev

# Terminal 2 - frontend en http://localhost:4200
cd frontend && npm install && npm start
```

`frontend/src/proxy.conf.json` reenvía `/api` a `http://localhost:3000`, así que
la app se comporta igual que en producción.

### Vía B: stack completo en Docker (local)

Un override convierte la red de Caddy en una red local, publica los puertos y
añade un nginx que proxea `/api`:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

| Servicio | URL local |
|----------|-----------|
| Frontend | http://localhost:8080 |
| Backend | http://localhost:3000/api/health |

El frontend usa nginx (`Dockerfile.prod` + `nginx.local.conf`), **no** `ng serve`,
así que un cambio en Angular exige reconstruir la imagen.

## ✅ Verificar que todo funciona

1. **Health check del backend (vías A y B):**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Respuesta esperada:
   ```json
   {
     "status": "ok",
     "mongodb": "conectado",
     "database": "recetario",
     "timestamp": "..."
   }
   ```

2. **Frontend:** `http://localhost:4200` (vía A) o `http://localhost:8080` (vía B)

3. **Base de datos:** es el clúster de Atlas (servicio `mongo` comentado). Se
   inspecciona con MongoDB Compass usando la cadena de `backend/.env`.

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
| `network caddy-central_default ... could not be found` | Estás usando el compose de VPS en local. Usa la vía A, o la vía B con `-f docker-compose.local.yml` |
| Puerto 3000 en uso | Cambiar `PORT` en `backend/.env` o parar el otro backend |
| Puerto 4200/8080 en uso | Parar el proceso que lo ocupa |
| Error de conexión MongoDB | Revisar `MONGODB_URI`/`MONGO_URI` en `backend/.env`; la base es Atlas, no hay contenedor local |
| Cambios de Angular no se ven | Vía A recarga sola; en la vía B hay que reconstruir la imagen |
| 413 al subir imagen (vía B) | Ya cubierto con `client_max_body_size 6m` en `nginx.local.conf` |
