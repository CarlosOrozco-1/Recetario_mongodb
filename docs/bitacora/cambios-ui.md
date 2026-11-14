# Cambios de interfaz

Registro de cambios visuales y de experiencia de usuario. Se actualiza con cada modificación de la interfaz.

## 2026-11-13

- **Recuperación de contraseña**: flujo completo de 3 pasos con stepper. El correo usa un diseño HTML moderno con código grande, fondo crema y encabezado con gradiente morado. El formulario ahora muestra el mensaje del backend cuando el envío no está disponible (por ejemplo, SMTP sin configurar o rechazo del proveedor) en lugar de ocultarlo tras un texto genérico.

- **Login**: se dividió la pantalla en dos columnas: panel izquierdo con la identidad de Sazón (logo, lema) y panel derecho con el formulario. El panel izquierdo usa una fotografía de fondo con overlay oscuro y el logo agrandado. El panel del formulario usa un fondo suave en lugar de blanco puro.
- **Registro**: mismo diseño de dos columnas con presentación de la red social y formulario mejorado (iconos, toggle de contraseña, estado de carga).
- **Inicio (landing)**: nueva ruta pública `/` con hero, características y llamadas a la acción. El fondo ahora cubre toda la página con la fotografía y overlays diferenciados por sección. Usuarios autenticados se redirigen al dashboard.
- **Marca**: se normalizó el nombre a "Sazón" en login, registro, landing y título del navegador.
- **Dashboard**: se añadieron pestañas "Me gusta" y "Guardadas" para listar recetas marcadas y guardadas por el usuario.

## 2026-11-10

- **Login**: se añadió el botón de Google con carga dinámica del script de identidad y manejo de errores de configuración.

## 2026-11-03

- **Instrucciones**: el formulario captura pasos numerados y el detalle los muestra como lista ordenada. Compatibilidad con recetas antiguas conservada.