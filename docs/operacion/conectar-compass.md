# Conectar a MongoDB Atlas con Compass

## URI a usar
En MongoDB Compass → New Connection → Advanced Connection Options → Connection String

Pega la cadena de conexión que está en `backend/.env`, en la variable `MONGODB_URI`
(tiene el formato `mongodb+srv://<usuario>:<clave>@<cluster>/recetario`). No se
documenta aquí para no exponer credenciales en el repositorio.

## Pasos
1. Abrir MongoDB Compass
2. Obtener `MONGODB_URI` de `backend/.env` y pegarla
3. Seleccionar "Use DNS SRV" (mongodb+srv ya lo usa)
4. Conectar
5. Seleccionar base `recetario`

## Verificación
Deberías ver colecciones: `users`, `recipes`, `comments`, `reviews`, `follows`,
`activityfeeds`, además de `uploads.files` y `uploads.chunks` (GridFS).

## Notas
- IP actual debe estar permitida en Atlas → Network Access. Si falla por IP, añade tu IP actual o temporalmente 0.0.0.0/0 (solo para pruebas puntuales).
- Usuario con permisos de lectura/escritura suficiente para inspeccionar/modificar.

## Comprobar estado desde backend
Desde VPS/proyecto: `curl https://foodloopc.duckdns.org/api/health` devuelve mongodb conectado.
