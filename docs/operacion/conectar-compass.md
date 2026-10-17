# Conectar a MongoDB Atlas con Compass

## URI a usar
En MongoDB Compass → New Connection → Advanced Connection Options → Connection String

Copia esta cadena:

```
mongodb+srv://carlosorozcok_db_user:kDKmctCQQdQIw7Eg@recetario-cluster.plsosta.mongodb.net/recetario
```

## Pasos
1. Abrir MongoDB Compass
2. Pegar la URI anterior (no tocar credenciales)
3. Seleccionar "Use DNS SRV" (mongodb+srv ya lo usa)
4. Conectar
5. Seleccionar base `recetario`

## Verificación
Deberías ver colecciones: `users`, `recipes`, `comments`, `reviews`, `follows`, `activities`, además de las de `uploads` si hay imágenes (GridFS).

## Notas
- IP actual debe estar permitida en Atlas → Network Access. Si falla por IP, añade tu IP actual o temporalmente 0.0.0.0/0 (solo para pruebas puntuales).
- Usuario con permisos de lectura/escritura suficiente para inspeccionar/modificar.

## Comprobar estado desde backend
Desde VPS/proyecto: `curl https://foodloopc.duckdns.org/api/health` devuelve mongodb conectado.
