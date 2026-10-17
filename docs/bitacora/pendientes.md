# Pendientes y tareas por hacer

## 1. Conexión a la base de datos desde el servidor
- [ ] Verificar la cadena de conexión `MONGODB_URI` en el servidor de producción (variables de entorno).
- [ ] Configurar acceso remoto a MongoDB Atlas: permitir IP del servidor en Network Access (o configurar acceso desde 0.0.0.0/0 con restricciones).
- [ ] Conectar con MongoDB Compass desde local hacia la instancia de Atlas usando la URI con credenciales.
- [ ] Documentar procedimiento para conectar Compass (pasos, URI, permisos mínimos).
- [ ] Evaluar si es conveniente conectarse directamente o usar un túnel/backup. Definir mejor práctica.

## 2. Revisar colección de usuarios
- [ ] Auditar esquema `User` (`models/user.js`): revisar campos `reviews`, `likes`, `saved`, etc.
- [ ] Verificar duplicidad con colección `Review`: ¿deberían existir reseñas embebidas en `User`?
- [ ] Revisar campos de reputación/calificaciones (`rating`, `avgRating`, `reviewCount`) — quién los calcula y cuándo.
- [ ] Normalizar: decidir si se mantiene denormalización o se consulta colección `Review`.
- [ ] Actualizar modelo de datos (`docs/modelo-datos/usuario.md`, `docs/modelo-datos/resena.md`) con decisión tomada.
- [ ] Corregir código si aplica (backend) sin romper endpoints existentes.
- [ ] Probar impacto con datos actuales (o simular).

## 3. Pruebas con Postman
- [ ] Crear un **Environment** en Postman (fuera del repo) con variables: `baseUrl`, `token`, `userId`, etc.
- [ ] Configurar colección existente (`postman/Recetario.postman_collection.json`) para usar variables de entorno.
- [ ] Añadir requests para flujos críticos: auth, recetas, imágenes, likes/saves, comentarios, reseñas, follows, feed.
- [ ] Guardar scripts de pre-request/test para obtener token automáticamente si aplica.
- [ ] Documentar cómo importar colección + environment en `docs/operacion/` o README de Postman.
- [ ] Ejecutar pruebas end-to-end y registrar resultados en bitácora.

## Prioridad
Orden sugerido: 1) conexión DB, 2) revisión usuarios/reviews, 3) Postman env.
