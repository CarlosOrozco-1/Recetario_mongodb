# Reglas para agentes y colaboradores

## Alcance tecnológico

- Frontend: Angular 21, TypeScript, RxJS y Angular Router.
- Backend: Node.js 20+, Express 5, Mongoose 9, JWT y `multer-gridfs-storage`.
- Datos: MongoDB Atlas y GridFS en el bucket `uploads`.
- Producción: Docker Compose, nginx y Caddy central.
- Desarrollo local: procesos independientes con `npm run dev` y `npm start`.
- Documentación formal: LaTeX compilado con Tectonic.

## Reglas de trabajo

1. Inspeccionar los archivos pertinentes antes de proponer o aplicar cambios.
2. Hacer cambios pequeños y verificables; no mezclar correcciones, funcionalidades y reorganizaciones en la misma operación cuando sea posible.
3. No dejar procesos de prueba en ejecución al terminar.
4. No confirmar cambios, crear commits, hacer push ni reconstruir producción salvo petición explícita del usuario.
5. Probar el código modificado:
   - Backend: `npm test` desde `backend/`.
   - Frontend: `npm test` desde `frontend/`.
   - Cambios de interfaz o formulario: `npx ng build --configuration production` desde `frontend/`.
6. Verificar la documentación modificada:
   - Mermaid debe conservar una sintaxis válida.
   - DERCAS debe compilar con `make` desde `docs/dercas`.
   - Corregir enlaces relativos después de mover archivos.

## Convenciones de código

- Seguir `docs/desarrollo/convenciones.md`.
- Identificadores en inglés y mensajes visibles en español.
- Modelos Mongoose en `PascalCase`; controladores, rutas y middlewares en `camelCase`.
- No exponer secretos, tokens ni cadenas de conexión en código, documentación, mensajes ni salidas de herramientas.
- No agregar secretos nuevos al repositorio. La exposición existente en `docker-compose.yml` está pendiente de rotación y limpieza, no debe normalizarse.
- Conservar la propiedad del lado del servidor: nunca aceptar `_id`, `usuario`, contadores, reportes ni métricas desde el cliente.
- Manejar explícitamente `400`, `401`, `404`, `429` y `500`; distinguir fallos de validación, autorización, ausencia de recurso, límite y error interno.

## Regla obligatoria de documentación

Todo cambio funcional, de comportamiento, de API, de datos, de despliegue o de defecto conocido debe documentarse en la carpeta correspondiente:

| Cambio | Documentación mínima |
|---|---|
| Proceso, plan o forma de trabajar | `docs/desarrollo/` |
| Instalación, operación local o despliegue | `docs/operacion/` |
| Defecto, causa y verificación | `docs/bitacora/` |
| Colecciones, campos, índices o GridFS | `docs/modelo-datos/` |
| Rutas, métodos, validaciones o respuestas | `docs/referencia/api.md` |
| Flujo operativo | `docs/diagramas/flujo/` |
| Caso de uso, actor, precondición o excepción | `docs/diagramas/casos-uso/` |
| Secuencia de interacción entre componentes | `docs/diagramas/secuencia/` |
| Ciclo de vida o estados de un recurso | `docs/diagramas/estado/` |
| Arquitectura, relaciones o índices gráficos | `docs/diagramas/` y el SVG/Mermaid correspondiente |

Además, el DERCAS también debe actualizarse cuando el cambio afecte:

- alcance, problema, solución, actores o procesos;
- endpoints, validaciones, respuestas o errores;
- modelo de datos, índices o almacenamiento;
- precedencia, documentación requerida o modelado UML;
- defectos conocidos o trabajo pendiente.

La actualización del DERCAS incluye:

1. Editar el capítulo correspondiente en `docs/dercas/capitulos/`.
2. Actualizar diagramas Markdown enlazados cuando corresponda.
3. Regenerar el PDF con `make` desde `docs/dercas`.
4. Registrar la revisión cuando el cambio sea relevante para la entrega.

No marcar como implementado aquello que solamente esté planificado, sea provisional o falle en una rama real del sistema.
