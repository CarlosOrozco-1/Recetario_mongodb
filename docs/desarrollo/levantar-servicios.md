# 🖥️ Levantar los servicios individualmente (desarrollo local)

En **local los servicios se levantan cada uno por su cuenta**, en su propia
terminal. **No uses `docker compose` en local**: el `docker-compose.yml` de la
raíz está pensado para la VPS y depende de la red `caddy-central_default`, que
solo existe en el servidor de producción.

## Requisitos

- Node.js 20+ y npm instalados.
- `backend/.env` con `JWT_SECRET` y la variable `MONGODB_URI` o `MONGO_URI`.
- En la configuración actual, la URI apunta a MongoDB Atlas. Las pruebas de escritura ejecutadas así modifican Atlas.

## Alternativa recomendada: stack local contenerizado

Para probar sin depender de Atlas, usa el stack aislado documentado en [`desarrollo-local-docker.md`](../operacion/desarrollo-local-docker.md): inicia MongoDB 8, backend y frontend con Podman Compose o Docker Compose. En Fedora/Podman:

```bash
podman compose -f local/compose.yaml up -d
```

Con Docker Compose v2, usa `docker compose -f local/compose.yaml up -d`.

La configuración del backend se inyecta desde el compose local y apunta a `recetario_local`; no modifica ni sustituye `backend/.env` de Atlas. En esta modalidad no necesitas iniciar cada servicio manualmente en una terminal aparte.

## Alternativa manual (backend/frontend en el host)

Si prefieres levantar Node y Angular directamente en dos terminales, necesitas una instancia MongoDB local corriendo primero y configurar temporalmente `MONGODB_URI` o `MONGO_URI` para apuntar a `mongodb://localhost:27017/recetario_local`. No sobrescribas la URI de Atlas en `backend/.env`; usa variables de entorno de la shell o un archivo local separado ignorado por Git. En esta modalidad el orden es MongoDB → backend → frontend.

## Paso 1 — Backend (terminal 1)

```bash
cd backend
npm install          # solo la primera vez
npm run dev
```

- `npm run dev` usa `nodemon`: recarga solo al cambiar el código.
- Responde en `http://localhost:3000`.
- Comprobar:

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

- Para producción sin recarga: `npm start` (ejecuta `node src/server.js`).

## Paso 2 — Frontend (terminal 2)

```bash
cd frontend
npm install          # solo la primera vez
npm start
```

- `npm start` ejecuta `ng serve --host 0.0.0.0 --proxy-config src/proxy.conf.json`.
- Abrir `http://localhost:4200`.

El proxy (`frontend/src/proxy.conf.json`) reenvía cualquier petición `/api/*` a
`http://localhost:3000`, así que la app se comporta igual que en producción
(no hace falta tocar nada más).

## Orden y detención

- Las dos terminales deben estar **corriendo a la vez**. Sin backend, el
  frontend se ve pero login/listas/recetas dan errores de red.
- Para detener: `Ctrl+C` en cada terminal.

## Verificación rápida

1. `curl http://localhost:3000/api/health` → `"mongodb": "conectado"`.
2. Entrar a `http://localhost:4200` y entrar con un usuario, p. ej. el de demo
   (`demo@test.com` / `12345678`).

## Problemas comunes

| Problema | Solución |
|----------|----------|
| `EADDRINUSE: 3000` | Otro backend está corriendo. Detenerlo o cambiar `PORT` en `backend/.env` |
| `EADDRINUSE: 4200` | Otro `ng serve` está corriendo. Detenerlo |
| Error de conexión MongoDB | Revisar `MONGODB_URI` en `backend/.env` y que el ordenador tenga internet |
| Frontend ok pero peticiones fallan | El backend no está arriba, o el proxy apunta mal (ver `proxy.conf.json`) |
| Avisos de deprecación de Mongoose | No bloquean nada; son informativos |

## Nota

Nada de esto es necesario en la VPS: allí el stack se despliega completo con
Docker Compose y Caddy (ver `docs/operacion/guia-deploy-vps.md`). Este flujo es
únicamente para desarrollar y probar en local.