# 🖥️ Levantar los servicios individualmente (desarrollo local)

En **local los servicios se levantan cada uno por su cuenta**, en su propia
terminal. **No uses `docker compose` en local**: el `docker-compose.yml` de la
raíz está pensado para la VPS y depende de la red `caddy-central_default`, que
solo existe en el servidor de producción.

## Requisitos

- Node.js 20+ y npm instalados.
- `backend/.env` con `JWT_SECRET` y la variable `MONGODB_URI` o `MONGO_URI`.
- En la configuración actual, la URI apunta a MongoDB Atlas. Las pruebas de escritura ejecutadas así modifican Atlas.

## Pendiente: entorno local aislado para pruebas de API

Las pruebas de endpoints deberían ejecutarse primero contra una instancia MongoDB local desechable y separada de Atlas, para evitar depender de la red y no modificar datos reales. Después de aprobar los flujos, los datos que se quieran conservar se registrarán explícitamente en Atlas; no se copiarán automáticamente.

Este entorno local aún no está configurado. La propuesta es levantar MongoDB 8 en `localhost:27017` con una base exclusiva (por ejemplo `recetario_test`) y una URI local seleccionada mediante una variable de entorno de pruebas, sin reemplazar ni versionar las credenciales de `backend/.env`. No usar `docker-compose.yml` de la raíz para esto: está destinado a VPS y contiene configuración de producción. Completar y validar este flujo es una tarea pendiente de Fase 3, Paso 27.

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
Docker Compose y Caddy (ver `docs/guia-deploy-vps.md`). Este flujo es
únicamente para desarrollar y probar en local.