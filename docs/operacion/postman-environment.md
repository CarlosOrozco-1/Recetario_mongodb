# Configurar Environment en Postman para pruebas

## 1. Crear Environment
En Postman → Environments → Create Environment → Nombre: `Recetario Local/Prod`

## 2. Variables para Local
Añadir:
- baseUrl → `http://localhost:3000/api`
- token → (vacío)
- userId → (vacío)
- recipeId → (vacío)

## 3. Variables para Producción
- baseUrl → `https://foodloopc.duckdns.org/api`
- token → (vacío)
- userId → (vacío)
- recipeId → (vacío)

## 4. Usar con la colección
Importar `postman/Recetario.postman_collection.json` y seleccionar el environment activo.

## 5. Flujo sugerido
1. POST /auth/register → guarda token/userId (si hay tests, revisar)
2. POST /auth/login → guarda token
3. CRUD recetas, imágenes, comentarios, reseñas, follows, activity

## 6. Health check rápido
GET {{baseUrl}}/health → debe retornar status ok y mongodb conectado.
