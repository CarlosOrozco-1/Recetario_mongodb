# Configurar Environment en Postman para pruebas

## Importar colecciones por entorno
Importa **solo la colección del entorno en que quieras probar**:

- Local: `postman/Recetario-Local.postman_collection.json` (`http://localhost:3000/api`). Usa MongoDB local del stack; no consulta Atlas.
- Remoto: `postman/Recetario-Remoto.postman_collection.json` (`https://foodloopc.duckdns.org/api`). Apunta a la API desplegada, que usa Atlas.

La colección remota incluye operaciones que crean, editan y eliminan datos. Ejecuta esas solicitudes únicamente con una cuenta/datos que puedas modificar y evita borrar contenido real.

Las dos colecciones incluyen las mismas rutas y variables, por lo que no hace falta cambiar `baseUrl` manualmente. Si prefieres usar Environment de Postman, puedes sobreescribir variables de colección con el Environment activo.

## 1. Crear Environment (opcional)
En Postman → Environments → Create Environment → Nombre: `Recetario Local` o `Recetario Remoto`

## 2. Variables para Local
Añadir:
- baseUrl → `http://localhost:3000/api`
- token → (vacío)
- userId → (vacío)
- recipeId → (vacío)
- commentId → (vacío)
- reviewId → (vacío)
- fileId → (vacío)
- otherUserId → (vacío, id de otro usuario para probar follows)

## 3. Variables para Remoto
- baseUrl → `https://foodloopc.duckdns.org/api`
- token → (vacío)
- userId → (vacío)
- recipeId → (vacío)
- commentId → (vacío)
- reviewId → (vacío)
- fileId → (vacío)
- otherUserId → (vacío)

## 4. Usar las colecciones
Importar `postman/Recetario-Local.postman_collection.json` o `postman/Recetario-Remoto.postman_collection.json` según corresponda.
Cada colección trae 8 carpetas (Health, Auth, Recipes, Recipes Social, Comments, Reviews, Follows, Activity) y guarda automáticamente `token`, `userId`, `recipeId`, `commentId`, `reviewId` y `fileId` desde las respuestas.

## 5. Flujo sugerido
1. POST /auth/register → guarda token/userId (si hay tests, revisar)
2. POST /auth/login → guarda token
3. CRUD recetas, imágenes, comentarios, reseñas, follows, activity

## 6. Health check rápido
GET {{baseUrl}}/health → debe retornar status ok y mongodb conectado.
