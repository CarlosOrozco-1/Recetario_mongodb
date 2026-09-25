# Guía de Deploy en VPS — Runbook reutilizable (Docker + Caddy central)

Runbook para desplegar aplicaciones web en una VPS Ubuntu Server con **Docker + Caddy
como entrada única**. La **Parte 1 es genérica**: sirve para cualquier proyecto nuevo
(Node, Python, Java, Go, etc.). La **Parte 2 es específica de Recetario/FoodLoop**.

> Documento vivo. Se llena **mientras** se ejecuta el deploy; los checkboxes marcan
> el avance real y la sección 6 es la bitácora.

---

## 0. Cómo usar esta guía

| Parte | Contenido | Cuándo se usa |
|-------|-----------|---------------|
| **1** | Topología y decisiones | Referencia |
| **2** | Runbook genérico, 7 fases | **Cada proyecto nuevo** (copiar el checklist de 2.8) |
| **3** | Runbook de Recetario | Este deploy |
| **4** | Operación diaria | Updates, rollback, logs |
| **5** | Troubleshooting | Cuando algo falla |
| **6** | Registro de avance | Bitácora de ejecución |

Reglas de oro que explican el 90 % de los errores:

1. **Caddy es la única puerta de entrada.** Nada se publica en puertos del host si
   Caddy lo enruta. Evita conflictos de puertos y deja un solo lugar donde revisar tráfico.
2. **Los servicios que Caddy debe alcanzar van en la red externa compartida**, no en la
   red default del proyecto. Si un servicio se queda en su red propia, Caddy no lo ve.
3. **Caddy no emite certificados para IPs.** Hace falta un hostname (DuckDNS, dominio
   propio) apuntando por DNS a la IP pública de la VPS.
4. **Si la VPS es chica, compila en local.** Build de frontends modernos pide 1–1.5 GB.
5. **Una app caída es un config de Caddy, no un problema de red.** Verifica siempre
   desde dentro de la red de Caddy, no desde el host.

---

## 1. Topología

```
Internet
   │
   │  app.duckdns.org   (DNS A → IP pública de la VPS)
   ▼
┌──────────────────────────────────────────────┐
│ Caddy  ·  contenedor  ·  puertos 80/443      │
│  TLS automático (Let's Encrypt)              │
│  una entrada, N subdominios                  │
└──────────────────────────────────────────────┘
   │                          │
   │ /api/*                   │ /*
   ▼                          ▼
┌───────────────┐      ┌──────────────────┐
│ app-backend   │      │ app-frontend     │
│ :3000         │      │ nginx:alpine :80 │
└───────────────┘      └──────────────────┘
   │                          │
   └──────────┬───────────────┘
              ▼
   red Docker externa compartida
   caddy-central_default
              │
              ▼
      MongoDB Atlas (externo, requiere whitelist de la IP de la VPS)
```

### Inventario del entorno (VPS `vpn-wireguard-server`)

| Dato | Valor |
|------|-------|
| SO | Ubuntu Server 24.04, hostname `vpn-wireguard-server` |
| IP pública (IPv4) | `161.153.28.223` (sin IPv6) |
| RAM | **956 MiB** · ~383 MiB disponibles |
| Swap | 8 GiB |
| Disco | 45 GB · 17 GB libres (64 % usado) |
| Caddy | Docker `caddy-central-caddy-1`, imagen `caddy:2-alpine` |
| Caddyfile (host) | `/home/ubuntu/gestionInventario/gestion-inventario-sprinReact/caddy-central/Caddyfile` |
| Caddyfile (contenedor) | `/etc/caddy/Caddyfile` (bind mount) |
| Certificados | Volumen Docker `caddy-central_caddy_data` |
| Config | Volumen Docker `caddy-central_caddy_config` |
| Red compartida | `caddy-central_default` |
| Puertos del host | 80, 443 (Caddy) · 8081, 8082 (apps previas) |
| Apps previas | `gestioninventario.duckdns.org` → `host.docker.internal:8081` · `gestion-frontend`/`gestion-backend` (8082, sin bloque en Caddy) |
| Base de datos | MongoDB Atlas `recetario-cluster.plsosta.mongodb.net` |

> ⚠️ **Deuda técnica a resolver algún día**: el Caddyfile vive dentro del repositorio de
> otra app (`gestion-inventario-sprinReact`). Si esa app se borra, Caddy se cae.
> Lo ideal es mover `caddy-central` a `~/caddy-central` como proyecto independiente.

---

## 2. PARTE 1 — Runbook genérico

### 2.1 Fase A — Diagnóstico (read-only, siempre primero)

```bash
free -h                      # RAM y swap: define si el build es local o remoto
nproc
df -h /                      # espacio
docker ps -a --format '{{.Names}}\t{{.Status}}\t{{.Image}}'   # qué hay corriendo
docker network ls            # confirmar que existe la red de Caddy
curl -4 -s ifconfig.me       # IP pública real
getent hosts app.duckdns.org # confirmar que el DNS apunta a esa IP
```

**Criterios de decisión**

| RAM disponible | Estrategia de build |
|----------------|--------------------|
| > 4 GB | Compilar en la VPS es viable |
| 1.5 – 4 GB | Backend en VPS, frontend en local |
| < 1.5 GB | **Todo en local**, subir artefactos con `rsync` |

### 2.2 Fase B — Repositorio y build

```bash
mkdir -p ~/<carpeta-proyecto> && cd ~/<carpeta-proyecto>
git clone -b pro git@github.com:<owner>/<repo>.git
```

- Siempre la rama de producción, nunca `desa`.
- Verificar que las ramas están al día: `git fetch --all && git branch -v`

Si el build es local:

```bash
# en la máquina local
npm ci && npm run build
rsync -avz --delete dist/ ubuntu@IP_VPS:/home/ubuntu/<proyecto>/dist/
```

### 2.3 Fase C — Red Docker compartida

Los servicios que Caddy debe resolver deben estar en `caddy-central_default`.
Si se olvida, Caddy devuelve `502`/`Connection refused` aunque el contenedor esté sano.

```yaml
# docker-compose.yml
services:
  backend:
    networks: [caddy]
  frontend:
    networks: [caddy]      # <- sin esto, el frontend cae en la red default

networks:
  caddy:
    external: true
    name: caddy-central_default
```

> **Trampa**: si solo un servicio declara `networks`, Compose igual crea la red
> `default` del proyecto para los demás. El síntoma es ver en el log
> `Network <proyecto>_default Created` y que el servicio no sea resoluble desde Caddy.

**No publicar puertos** de los servicios que Caddy enruta. Publica solo si necesitas
acceso directo para debug (y entonces usa puertos altos libres).

```bash
# Verificar que quedó bien
docker network inspect caddy-central_default --format '{{range .Containers}}{{.Name}}{{"\n"}}{{end}}'
```

### 2.4 Fase D — Frontend estático con nginx

Un dev server de Angular/Next/Vite consume ~1 GB de RAM. En producción, build estático + nginx:

```dockerfile
# Frontend/Dockerfile (multi-stage)
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/<app>/browser /usr/share/nginx/html
EXPOSE 80
```

```nginx
# nginx.conf — obligatorio para SPAs
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;   # rutas de Angular/React
    }

    location ~* \.(js|css|png|jpg|svg|ico|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

> Sin `try_files ... /index.html`, recargar `/recipe/123` da 404 aunque la app funcione.

Si la RAM no da para compilar en la VPS: imagen `nginx:alpine` pelada + bind mount del
`dist/` subido por `rsync`.

### 2.5 Fase E — Bloque en Caddy

Añadir al Caddyfile (respetando la indentación con tabs):

```caddy
app.duckdns.org {
	encode gzip zstd

	log {
		output file /data/access/app.log {
			roll_size 10MiB
			roll_keep 5
		}
	}

	handle /api/* {
		reverse_proxy app-backend:3000
	}

	handle {
		reverse_proxy app-frontend:80
	}
}
```

**Por qué `log` dentro del bloque y no global**: `roll_size` y `roll_keep` son válidos
solo en el método `output file`. Caddy **no escribe access logs por defecto**.

**Antes de recargar, validar siempre:**

```bash
# editar el Caddyfile en el host
docker exec caddy-central-caddy-1 caddy validate --config /etc/caddy/Caddyfile
```

### 2.6 Fase F — Verificación (en este orden)

```bash
# 1. El contenedor está vivo y sin reinicios en loop
docker top app-backend
docker logs app-backend --tail 20

# 2. La app responde DESDE LA RED DE CADDY (origen real del tráfico)
docker exec caddy-central-caddy-1 wget -qO- http://app-backend:3000/api/health

# 3. Caddy enruta bien
curl -i -H "Host: app.duckdns.org" http://127.0.0.1/api/health

# 4. TLS y público
curl -i https://app.duckdns.org/api/health

# 5. Frontend carga y llama a la API (DevTools → Network)
```

> El paso 2 es el que de verdad importa. `curl localhost:3000` desde el host **va a fallar
> siempre** si el servicio no publica puertos, y eso es correcto.

### 2.7 Fase G — Operación

```bash
# Actualizar
cd ~/<proyecto> && git pull origin pro
docker compose up -d --build

# Ver logs en vivo
docker compose logs -f backend

# Recargar Caddy sin downtime (no reinicia el contenedor)
docker exec caddy-central-caddy-1 caddy reload --config /etc/caddy/Caddyfile

# Rollback
git log --oneline -5
git checkout <commit-bueno> && docker compose up -d --build
```

> `docker compose restart caddy` (desde el proyecto de caddy) **corta el tráfico de
> todas las apps** durante unos segundos. Prefiere siempre `caddy reload`.

### 2.8 Checklist reutilizable (copiar por proyecto)

```
[ ] 1. free -h / df -h / → decidir build local o remoto
[ ] 2. DNS del subdominio apunta a la IP pública
[ ] 3. git clone -b pro
[ ] 4. docker-compose.yml: servicios en red externa caddy-central_default
[ ] 5. docker-compose.yml: sin ports publicados para lo que enruta Caddy
[ ] 6. Frontend: build estático + nginx.conf con try_files
[ ] 7. .env / secrets fuera de git y fuera de la imagen (env_file o .dockerignore)
[ ] 8. Si hay BD gestionada: agregar la IP de la VPS a la whitelist
[ ] 9. docker exec caddy-central-caddy-1 wget -qO- http://app-backend:PORT/api/health
[ ] 10. Caddy: bloque del subdominio + log con roll_size
[ ] 11. caddy validate → caddy reload
[ ] 12. curl -H "Host: app.dominio" http://127.0.0.1/... y luego https://
[ ] 13. Login + CRUD + carga de imágenes desde el navegador
```

---

## 3. PARTE 2 — Recetario / FoodLoop

### 3.1 Decisiones específicas

| Decisión | Valor | Motivo |
|----------|-------|--------|
| Hosting | 100 % VPS (frontend + backend) | La API ya vive en la VPS; el híbrido solo añade un segundo sistema |
| Base de datos | MongoDB Atlas | Evita gastar RAM de la VPS (956 MiB) |
| Origen | `foodloopc.duckdns.org` | Necesario para TLS; Caddy no emite certificados para IPs |
| Frontend | Build estático en local + `nginx:alpine` en la VPS | El build de Angular (~1.5 GB) no cabe en 956 MiB |
| Backend | `npm start` (no `npm run dev`) en producción | `nodemon` añade vigilancia de archivos innecesaria en prod |
| Nombre del proyecto | `name: recetario_mongodb` fijado en el compose | Sin esto la imagen local se llama `recetario-frontend` y la de la VPS `recetario_mongodb-frontend`, y la transferencia `docker save`/`load` no cuadra |
| Dockerfile frontend | `Dockerfile.prod` multi-stage (no el de desarrollo) | Permite `ng serve` en local y nginx estático en prod con el mismo repo |
| Presupuesto CSS | `anyComponentStyle` subido a 24 kB / 32 kB | `dashboard.css` pesa 25 KB y **bloqueaba** el build de producción |
| Orígenes API | Relativos (`/api/...`) | Obliga a mismo origen: por eso Caddy enruta frontend y API juntos |

> Por qué el frontend **no** puede vivir suelto en Render: los servicios Angular usan
> URLs relativas (`/api/auth`, `/api/recipes`). Un static site de Render no hace proxy
> de `/api`, así que el navegador pediría la API a Render y recibiría 404.

### 3.2 Estado del deploy

| Componente | Estado | Detalle |
|------------|--------|---------|
| Repo en VPS | ✅ | `/home/ubuntu/recetarioMongo/Recetario_mongodb` |
| DNS | ✅ | `foodloopc.duckdns.org` → `161.153.28.223` |
| Red Docker | ✅ | `caddy-central_default` |
| Atlas whitelist | ✅ | `161.153.28.223/32` agregada |
| Backend + Atlas | ✅ | `{"status":"ok","mongodb":"conectado"}` |
| Backend en red de Caddy | ✅ | `recetario-backend` → `172.20.0.3` |
| Frontend estático | ✅ | Imagen `recetario_mongodb-frontend` (95 MB) construida y probada |
| Red del frontend | ✅ | Ambos servicios en `caddy-central_default` |
| Bloque en Caddy | ❌ | Falta escribirlo y recargar |
| Verificación pública | ⏳ | Pendiente |

### 3.3 Checklist de ejecución

- [x] **Step 0** — Repo clonado en `/home/ubuntu/recetarioMongo/Recetario_mongodb`
- [x] **Step 1** — Diagnóstico completo
- [x] **Step 1b** — IP `161.153.28.223/32` en Atlas Network Access
- [x] **Step 2** — Backend arriba y verificado desde la red de Caddy
- [x] **Step 3** — Ambos servicios en la red externa `caddy-central_default`
- [x] **Step 4** — `frontend/Dockerfile.prod` + `nginx.conf` + `.dockerignore`
- [x] **Step 4** — Build de producción verificado en local (`/healthz` y fallback SPA OK)
- [x] **Step 4** — Presupuesto CSS de Angular corregido (bloqueaba el build)
- [x] **Step 5** — Imagen compilada en la VPS (94.2 MB) y contenedor recreado
- [x] **Step 5** — Verificado: nginx escucha en `:80` y `/healthz` responde `ok` desde Caddy
- [x] **Step 6** — Bloque de Caddy con `handle /api/*` (no `handle_path`), `caddy validate` y `caddy reload` OK
- [x] **Step 6** — Certificado Let's Encrypt emitido para `foodloopc.duckdns.org`
- [x] **Step 7** — Verificación end-to-end en navegador: login, CRUD y social OK
- [x] **Step 7** — Imágenes: corregidos 4 bugs (ruta bajo JWT, `MONGODB_URI`, `sharp` sin buffer, `PUT` vs `POST`)
- [x] **Step 7** — Toggle de visibilidad con modal de confirmación (tarjeta y modal de detalle)
- [ ] **Step 7** — Revalidar en VPS: imagen visible en tarjeta y modal de detalle

### 3.4 Procedimiento de deploy del frontend

**Estrategia actual: construir en la VPS con un solo comando y una sola sesión SSH.**

La VPS tiene 956 MiB de RAM, así que el build de Angular (~1.5 GB) entra por swap y
tarda **~8 minutos**. Durante ese tiempo los otros servicios de la VPS se sienten
lentos. A cambio no hace falta transferir nada: cero `scp`, cero imágenes por tubería,
un solo comando.

```bash
cd /home/ubuntu/recetarioMongo/Recetario_mongodb

# 1. Construir (usa frontend/Dockerfile.prod, no el de desarrollo)
docker compose build frontend

# 2. Confirmar que salió la imagen correcta
docker images recetario_mongodb-frontend --format '{{.ID}} {{.Size}}'
# Debe pesar ~95 MB. Si pesa ~1.5 GB, se compiló el dev server: revisa que el
# compose apunte a `dockerfile: Dockerfile.prod`.

# 3. Recrear el contenedor (toma la imagen recién construida)
docker compose up -d --no-build --force-recreate frontend

# 4. Verificar
docker exec recetario-frontend netstat -ltn | grep LISTEN    # debe listen en :80
docker exec caddy-central-caddy-1 wget -qO- http://recetario-frontend/healthz
```

> **Regla dura: verificar el peso de la imagen antes de levantar.** Si el build
> generó la imagen de desarrollo (~1.5 GB), el frontend volverá a `ng serve` en el
> 4200 y Caddy no encontrará nada en el 80. La causa es que el compose apuntara a
> `frontend/Dockerfile` (dev) en vez de `Dockerfile.prod`.

> **Un contenedor no cambia de imagen aunque reetiquetes la etiqueta.** Por eso el
> paso 3 lleva `--force-recreate`.

> `--no-build` evita que `up` intente recompilar. Sin él, y sin la imagen presente,
> Docker intentaría compilar Angular otra vez.

#### Alternativa más rápida (si molesta esperar)

Compilar en local y copiar solo los archivos estáticos. Evita el swap en la VPS, pero
necesita una segunda pestaña con `scp` y deja el contenedor dependiendo de archivos
del host:

```bash
# local
cd frontend && npm run build
scp -r dist/recetario-app/browser ubuntu@IP:/home/ubuntu/recetarioMongo/Recetario_mongodb/frontend/dist/
```

### Trampa de nombres de imagen

| Nombre | Dónde | Qué es |
|--------|-------|--------|
| `recetario_mongodb-frontend` | local y VPS | La de producción (nginx, 95 MB) |
| `recetario-frontend` | solo local | La vieja de desarrollo (1.54 GB), del nombre de proyecto anterior |

Por eso el `name: recetario_mongodb` en el compose: sin él, cada máquina nombra la
imagen distinto y las referencias cruzadas no cuadran.


### 3.4 Comandos de esta VPS

```bash
# Estado
cd /home/ubuntu/recetarioMongo/Recetario_mongodb
docker compose ps
docker compose logs -f backend

# Health desde la red de Caddy (el único test válido)
docker exec caddy-central-caddy-1 wget -qO- http://recetario-backend:3000/api/health

# Caddy
docker exec caddy-central-caddy-1 caddy validate --config /etc/caddy/Caddyfile
docker exec caddy-central-caddy-1 caddy reload   --config /etc/caddy/Caddyfile
docker exec caddy-central-caddy-1 caddy fmt      --config /etc/caddy/Caddyfile  # formatea tabs

# Caddyfile
sudo nano /home/ubuntu/gestionInventario/gestion-inventario-sprinReact/caddy-central/Caddyfile
```

### 3.5 Pendientes técnicos del código

**Resueltos (verificado con `npm test` en `backend/`, 10 casos):**

| Tema | Causa raíz | Solución | Archivo |
|------|------------|----------|---------|
| Subida de imágenes | `multer-gridfs-storage` solo leía `MONGO_URI`; el compose define `MONGODB_URI` | Aceptar ambos: `process.env.MONGODB_URI \|\| process.env.MONGO_URI` | `backend/src/middleware/upload.js` |
| Validación de imagen | `sharp(req.file.buffer)`; GridFS consume el archivo por streaming y no deja buffer | Validación movida al cliente (mide con `new Image()`), y se eliminó la dependencia nativa `sharp` | `backend/src/middleware/upload.js`, `frontend/src/app/components/recipe-form/recipe-form.ts` |
| Servir imagen | La ruta estaba **después** de `router.use(auth)`; `<img src>` no puede enviar cabeceras → 401 | Declarar `GET /image/:fileId` **antes** de `router.use(auth)` | `backend/src/routes/recipes.js` |
| Subida de imagen (método) | El frontend enviaba `PUT /:id/image`; el backend solo tenía `POST` | `http.post` en `uploadImage()` | `frontend/src/app/services/recipe.service.ts` |
| Mass-assignment | `update` pasaba `req.body` crudo a `findOneAndUpdate`; un `{"usuario": "..."}` robaba la receta y `{"likesCount": 9999}` falseaba métricas | Allowlist `EDITABLE_FIELDS` en `create` y `update` + `runValidators` | `backend/src/controllers/recipeController.js` |
| Visibilidad dinámica | La casilla "pública" solo se podía cambiar reabriendo el editor | Badge como botón + modal de confirmación, en la tarjeta y en el modal de detalle | `frontend/src/app/components/dashboard/dashboard.{ts,html,css}` |

> **Por qué no se guardó base64 en la receta:** el 401 ocurre *antes* de mirar los
> bytes, así que cambiar el formato no habría arreglado nada. Además, 5 MB de
> imagen son ~6.7 MB de texto (MongoDB corta en 16 MB por documento), inflaría
> cada `GET /api/recipes` y quitaría la caché independiente del navegador. Servir
> el binario desde GridFS sin cabeceras es lo correcto.

**Pendientes:**

| Tema | Problema | Archivo |
|------|----------|---------|
| Imagen huérfana | Reemplazar imagen no borra la anterior de GridFS | `backend/src/controllers/recipeController.js` |
| Perfil | Ruta `/profile/:username` pero `User` no tiene `username` | `backend/src/models/User.js` |
| Respuestas anidadas | `getByRecipe` solo trae respuestas de primer nivel | `backend/src/controllers/commentController.js` |
| Reglas de negocio | Like propio y responder propio solo se bloquean en el frontend | `recipeSocialController.js`, `commentController.js` |
| Actividad | Enum sin `compartio_receta`, pero el controlador la crea | `backend/src/models/ActivityFeed.js` |
| Rate limit | `uploadLimiter` definido y no aplicado | `backend/src/routes/recipes.js` |
| Sanitización | `sanitizeBody` existe y no se aplica globalmente | `backend/src/middleware/sanitize.js` |
| Trust proxy | Falta configurar para que el rate limit no vea todo como la IP de Caddy | `backend/src/server.js` |
| Magic bytes | El filtro se basa en el `Content-Type` que envía el cliente (fácil de falsear) | `backend/src/middleware/upload.js` |
| Secretos | `docker-compose.yml` tiene Atlas URI y `JWT_SECRET` en claro | `docker-compose.yml` |
| Build context | Sin `.dockerignore`, `COPY . .` puede incrustar `backend/.env` | `backend/.dockerignore` |

**Regresión de seguridad que conviene añadir a `backend/test/recipes.test.js`**
cuando se toque cualquiera de estos archivos: el orden de las capas del router
(es decir, que la imagen siga siendo pública y el resto no) y la allowlist de
campos editables.

---

## 4. Operación diaria (resumen)

```bash
# Actualizar
cd /home/ubuntu/recetarioMongo/Recetario_mongodb
git pull origin pro
docker compose up -d --build

# Frontend: compilar en LOCAL y subir
#   local:  cd frontend && npm ci && npm run build
#   local:  rsync -avz --delete dist/recetario-app/browser/ \
#            ubuntu@161.153.28.223:/home/ubuntu/recetarioMongo/Recetario_mongodb/frontend/dist/
#   vps:    docker exec recetario-frontend nginx -s reload

# Caddy: validar y recargar (sin downtime)
docker exec caddy-central-caddy-1 caddy validate --config /etc/caddy/Caddyfile
docker exec caddy-central-caddy-1 caddy reload   --config /etc/caddy/Caddyfile
```

---

## 5. Troubleshooting

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `502` o `Connection refused` desde Caddy | La app crasheó o no está en la red de Caddy | `docker logs <app>` y `docker network inspect caddy-central_default` |
| `Could not connect to any servers in your MongoDB Atlas cluster` | IP de la VPS sin whitelist | Atlas → Network Access → `161.153.28.223/32` |
| `curl localhost:3000` → *Connection refused* | El backend no publica puertos (intencional) | Probar desde la red de Caddy con `docker exec caddy-central-caddy-1 wget ...` |
| `Network <proyecto>_default Created` en el log | Algún servicio quedó fuera de la red externa | Declarar `networks` en **todos** los servicios |
| `docker stats` con muchos PIDs | Son hilos de Node, no procesos | `docker top <app>` para el conteo real |
| 404 al recargar una ruta interna | Falta `try_files $uri /index.html` en nginx | Agregar el `location /` de la SPA |
| TLS no se emite | El DNS no apunta a la VPS, o el puerto 443 está cerrado en el NSG | `getent hosts <dominio>` y revisar reglas de Oracle |
| Build Angular se muere | RAM insuficiente (build pide ~1.5 GB) | Compilar en local y transferir la imagen |
| `anyComponentStyle exceeded maximum budget` | Un CSS de componente pasó el límite de producción | Subir el presupuesto en `angular.json` **o** dividir el CSS; en desarrollo no salta |
| `wget: can't connect to remote host: Connection refused` dentro de un contenedor | BusyBox resuelve `localhost` a `::1` y nginx escucha solo en IPv4 | Usar `http://127.0.0.1/...` en vez de `localhost` |
| `docker compose up` intenta recompilar en la VPS | Falta la imagen transferida | `docker compose up -d --no-build` y transferir antes con `docker save \| ssh docker load` |
| El contenedor corre la imagen vieja después de un `docker load` | **Un contenedor conserva la imagen con la que nació**; reetiquetar no lo afecta | `docker compose up -d --no-build --force-recreate <servicio>` |
| El frontend responde en 4200 en vez de 80 | Se compiló `frontend/Dockerfile` (dev) en vez de `Dockerfile.prod` | `docker images ... --format '{{.Size}}'`: ~95 MB = nginx, ~1.5 GB = dev |
| 404 en todas las rutas de la API | Usaste `handle_path /api/*` en vez de `handle /api/*` | `handle_path` **elimina** el prefijo y el backend espera la ruta completa |
| Comandos enviados al equipo equivocado | Terminal nueva abierta en local | Encabezar todo bloque con `hostname`; debe decir `vpn-wireguard-server` |
| El nombre de imagen difiere entre local y VPS | El nombre del proyecto se deriva del directorio | Fijar `name:` en el compose |
| `git push` → *Permission denied (publickey)* | Sin llave SSH en la VPS | `ssh-keygen` + `ssh-copy-id` al repo, o usar HTTPS con token |
| Cambios de `package.json` no se aplican | Volumen anónimo `/app/node_modules` con dependencias viejas | `docker compose down -v` y volver a levantar |
| `nodemon` reiniciando en loop | Volumen de código montado sobre algo que escribe en `/app` | Quitar bind mount en producción |
| Permisos denegados en `.angular/cache` | Caché versionada en git y en manos de root | `sudo chown -R $USER:$USER frontend/.angular` y dejar de versionarla |
| `caddy validate` falla tras editar | Indentación con espacios en vez de tabs | `caddy fmt --config /etc/caddy/Caddyfile` |

---

## 6. Registro de avance

| Fecha | Step | Resultado |
|-------|------|-----------|
| 2026-09-25 | Step 0 | Repo clonado en `/home/ubuntu/recetarioMongo/Recetario_mongodb` |
| 2026-09-25 | Step 1 | Diagnóstico: 956 MiB RAM, 17 GB disco, DNS correcto, red compartida OK |
| 2026-09-25 | Step 1b | **Root cause del fallo**: IP de la VPS ausente en whitelist de Atlas |
| 2026-09-25 | Step 2 | Backend arriba: `{"status":"ok","mongodb":"conectado"}` |
| 2026-09-25 | Step 2 | Detectado: frontend quedó en `recetario_mongodb_default` (red incorrecta) |
| 2026-09-25 | Step 3 | `frontend` movido a `caddy-central_default`; `name: recetario_mongodb` fijado en compose |
| 2026-09-25 | Step 4 | `Dockerfile.prod` + `nginx.conf` + `.dockerignore` creados |
| 2026-09-25 | Step 4 | **Bloqueo encontrado**: presupuesto `anyComponentStyle` de Angular rechazaba `dashboard.css` (19.7 kB > 16 kB). Subido a 24/32 kB |
| 2026-09-25 | Step 4 | Imagen construida y verificada: `/healthz` → `ok`, `/receta/123` → fallback SPA OK, 95 MB |
| 2026-09-25 | Step 5 | Diagnóstico: el contenedor corría la imagen de **desarrollo** (`ng serve` en 4200) porque un `--build` en la VPS reetiquetó `recetario_mongodb-frontend` |
| 2026-09-25 | Step 5 | Build en la VPS con `Dockerfile.prod` (311 s) → imagen 94.2 MB → nginx en `:80`, `/healthz` OK desde Caddy |
| 2026-09-25 | Step 5 | Dominio confirmado: `recetario.duckdns.org` apunta a `188.65.93.134` (**otra IP, en desuso**). Se usa `foodloopc.duckdns.org` |
| 2026-09-25 | Step 6 | Caddy: `Valid configuration` → `reload` sin downtime → HTTP 308 a HTTPS → **HTTP/2 200** con health check de Atlas |
| 2026-09-25 | Step 6 | Frontend público verificado: 200 en `/` y en `/login` (fallback SPA), título `Recetario - Tus recetas de cocina` |

---

## 7. Estado final del deploy (2026-09-25)

| Componente | Estado | Verificación |
|------------|--------|--------------|
| DNS | ✅ | `foodloopc.duckdns.org` → `161.153.28.223` |
| Caddy + TLS | ✅ | HTTP/2, certificado Let's Encrypt automático |
| Frontend | ✅ | nginx sirviendo el build de Angular, fallback SPA OK |
| Backend | ✅ | Express en `recetario-backend:3000` |
| Atlas | ✅ | `mongodb: conectado`, db `recetario` |
| Rate limiting | ✅ | Cabeceras `ratelimit-*` presentes |
| Red compartida | ✅ | Ambos servicios en `caddy-central_default` |
| Reinicio automático | ✅ | `restart: unless-stopped` en ambos servicios |

**URL pública:** https://foodloopc.duckdns.org
**Usuario de prueba:** `demo@test.com` / `12345678`

### Pendiente antes de considerar el deploy cerrado

| # | Tema | Prioridad |
|---|------|-----------|
| 1 | La VPS despliega desde `desa`, no desde `pro` | Alta |
| 2 | Commit de `Dockerfile.prod` existe solo en `desa` | Alta |
| 3 | `middleware/upload.js` lee `MONGO_URI` y el compose define `MONGODB_URI` → la **subida de imágenes falla** | Alta |
| 4 | `sharp(req.file.buffer)` no funciona con GridFS (no deja `buffer`) | Alta |
| 5 | `GET /api/recipes/image/:fileId` exige JWT y `<img src>` no lo envía → **las imágenes no se ven** | Alta |
| 6 | Validación de dimensiones sin revisar | Media |
| 7 | `sanitizeBody` definido y no aplicado globalmente | Media |
| 8 | `uploadLimiter` definido y no aplicado | Media |
| 9 | Sin `trust proxy`: el rate limit ve siempre la IP de Caddy | Media |
| 10 | Atlas URI y `JWT_SECRET` en claro en `docker-compose.yml` | Media |
| 11 | Sin `.dockerignore` en `backend/` → `COPY . .` puede incrustar `.env` | Media |
| 12 | Caché `.angular/cache` versionada en git | Baja |
| 13 | `caddy fmt --overwrite` para normalizar la indentación | Baja |
| 14 | Respuestas anidadas y perfil por `username` sin soporte real | Baja |
