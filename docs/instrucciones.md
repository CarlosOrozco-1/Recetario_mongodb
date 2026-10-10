# 🚀 Instrucciones para Levantar los Servicios

## Requisitos

- Node.js 20+ y npm.
- `backend/.env` con la cadena de Atlas (ya existe).
- En la VPS: Docker + Docker Compose.

## ⚠️ Dos escenarios: VPS y local

El `docker-compose.yml` de la raíz es **solo para la VPS**. Depende de la red
externa `caddy-central_default`, que crea el proyecto Caddy central en el
servidor. En local esa red no existe, así que `docker compose up` falla con:

> network caddy-central_default declared as external, but could not be found

Además, Caddy es quien enruta `/api/*` al backend; sin Caddy, el nginx del
frontend no sabe a quién pedirle la API.

### En local: los servicios se levantan individualmente

**Cada servicio en su propia terminal.** El detalle paso a paso está en
[Levantar los servicios individualmente](./levantar-servicios.md).

```bash
# Terminal 1 - backend en http://localhost:3000
cd backend && npm install && npm run dev

# Terminal 2 - frontend en http://localhost:4200
cd frontend && npm install && npm start
```

`frontend/src/proxy.conf.json` reenvía `/api` a `http://localhost:3000`, así que
la app se comporta igual que en producción.

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
     "timestamp": "..."
   }
   ```

2. **Frontend:** `http://localhost:4200`

3. **Base de datos:** es el clúster de Atlas (servicio `mongo` comentado). Se
   inspecciona con MongoDB Compass usando la cadena de `backend/.env`.

## 📖 Comandos útiles (solo VPS)

Estos comandos son para el servidor de producción, donde sí hay Docker.
Para desarrollo local usa [Levantar los servicios individualmente](./levantar-servicios.md).

### Ver logs
```bash
docker compose logs backend
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

### Ejecutar comandos dentro de un contenedor
```bash
docker exec -it recetario-backend sh
docker exec -it recetario-frontend sh
```

## 🐳 Reconstruir en la VPS tras un cambio

```bash
git pull
docker compose build
docker compose up -d
```

> En la VPS hay RAM limitada: si el build de Angular no termina por falta de
> memoria, se compila en local y se suben el bundle o la imagen. Ver
> `docs/guia-deploy-vps.md`.

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
| `network caddy-central_default ... could not be found` | Estás usando el compose de VPS en local. En local los servicios se levantan individualmente (ver `docs/levantar-servicios.md`) |
| Puerto 3000 en uso | Cambiar `PORT` en `backend/.env` o parar el otro backend |
| Puerto 4200 en uso | Parar el otro `ng serve` |
| Error de conexión MongoDB | Revisar `MONGODB_URI`/`MONGO_URI` en `backend/.env`; la base es Atlas, no hay contenedor local |
| Cambios de Angular no se ven | `ng serve` recarga solo; hard-refresh (Ctrl+F5) si el navegador cachea |
