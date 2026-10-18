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

### En local: stack contenerizado (recomendado)

Levanta **MongoDB 8 + backend + frontend** con un solo comando, aislado de
Atlas. Detalle completo en
[Desarrollo local contenerizado](./desarrollo-local-docker.md):

```bash
# Podman Compose
podman compose -f local/compose.yaml up -d

# Docker Compose v2
# docker compose -f local/compose.yaml up -d
```

- MongoDB solo publica `127.0.0.1:27017` con volumen propio (`mongo-local-data`).
- Backend en `http://localhost:3000` con `MONGODB_URI=mongodb://mongo:27017/recetario_local`
  (inyectada por el compose; no usa `backend/.env` ni Atlas).
- Frontend en `http://localhost:4200`; el proxy redirige `/api` al backend.
- Detener: `podman compose -f local/compose.yaml down` (los datos persisten en el volumen).

### En local: servicios individuales (alternativa)

Si prefieres Node y Angular en el host (necesitas una instancia MongoDB local
apuntando a `recetario_local`), el detalle paso a paso está en
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
   Respuesta esperada (stack local: la base es `recetario_local`; con servicios
   individuales apuntando a Atlas: `recetario`):
   ```json
   {
     "status": "ok",
     "mongodb": "conectado",
     "database": "recetario_local",
     "timestamp": "..."
   }
   ```

2. **Frontend:** `http://localhost:4200`

3. **Base de datos:** en el stack local es el contenedor `mongo` (accesible con
   Compass en `mongodb://localhost:27017`, base `recetario_local`). En el
   esquema individual es el clúster de Atlas (cadena en `backend/.env`).

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
> `docs/operacion/guia-deploy-vps.md`.

## 🧪 Pruebas con Postman

1. Importar `postman/Recetario-Local.postman_collection.json` (local) o `postman/Recetario-Remoto.postman_collection.json` (remoto) en Postman
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
| `network caddy-central_default ... could not be found` | Estás usando el compose de VPS en local. En local usa `local/compose.yaml` o los servicios individuales (ver `docs/desarrollo/levantar-servicios.md`) |
| Puerto 3000 en uso | Cambiar `PORT` en `backend/.env` o parar el otro backend |
| Puerto 4200 en uso | Parar el otro `ng serve` |
| Error de conexión MongoDB (stack local) | Verificar que el compose local esté levantado (`podman compose -f local/compose.yaml ps`) y el healthcheck de `mongo` en `healthy` |
| Error de conexión MongoDB (servicios individuales) | Revisar `MONGODB_URI`/`MONGO_URI`; si apunta a Atlas la máquina necesita internet |
| Cambios de Angular no se ven | `ng serve` recarga solo; hard-refresh (Ctrl+F5) si el navegador cachea |
