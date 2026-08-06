# 🍳 Recetario Personal - Stack MEAN

Aplicación web para gestionar recetas de cocina personales, construida con el stack **MEAN**: MongoDB, Express, Angular y Node.js.

> Proyecto de práctica para aprender el stack MEAN y MongoDB.

---

## 🧰 Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **M**ongoDB | MongoDB | 8 |
| **E**xpress | Express.js | 5 |
| **A**ngular | Angular | 21 |
| **N**ode.js | Node.js | 20 |

## 📁 Estructura del Proyecto

```
recetario/
├── backend/               → API REST (Node.js + Express + MongoDB)
│   └── src/
│       ├── config/        → Configuración
│       ├── controllers/   → Lógica de negocio (consultas MongoDB)
│       ├── middleware/    → Autenticación JWT
│       ├── models/        → Schemas de Mongoose
│       ├── routes/        → Definición de endpoints
│       └── server.js      → Punto de entrada
├── frontend/              → Interfaz de usuario (Angular)
│   └── src/app/
│       ├── components/    → Componentes de la UI
│       ├── guards/        → Protección de rutas
│       ├── services/      → Comunicación con la API
│       ├── app.ts         → Componente raíz
│       └── app.routes.ts  → Definición de rutas
├── docs/                  → Documentación del proyecto
│   ├── diagramas/         → Diagramas de flujo y casos de uso
│   ├── Fases-de-desarrollo.md → Plan de aprendizaje
│   ├── convenciones.md    → Convenciones de nomenclatura
│   └── instrucciones.md   → Guía para levantar servicios
├── postman/               → Colección Postman para pruebas
└── docker-compose.yml     → Orquestación de contenedores
```

## ⚙️ Instalación y Ejecución

### Requisitos previos
- Docker y Docker Compose

### Paso 1 - Levantar los servicios
```bash
docker compose up --build
```

### Paso 2 - Acceder a la aplicación
| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:3000 |
| MongoDB | mongodb://localhost:27017 |

### Verificación rápida
```bash
curl http://localhost:3000/api/health
```

---

## 📡 Endpoints de la API

### Autenticación
| Método | Endpoint | Descripción | Autenticado |
|--------|----------|-------------|:-----------:|
| POST | `/api/auth/register` | Registrar usuario | ❌ |
| POST | `/api/auth/login` | Iniciar sesión | ❌ |

### Recetas
| Método | Endpoint | Descripción | Autenticado |
|--------|----------|-------------|:-----------:|
| GET | `/api/recipes` | Listar recetas del usuario | ✅ |
| GET | `/api/recipes/:id` | Obtener una receta | ✅ |
| POST | `/api/recipes` | Crear receta | ✅ |
| PUT | `/api/recipes/:id` | Actualizar receta | ✅ |
| DELETE | `/api/recipes/:id` | Eliminar receta | ✅ |

### Salud
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Estado de la API y conexión a MongoDB |

---

## 🔐 Autenticación

El sistema usa **JWT (JSON Web Tokens)** con expiración de 30 días.

1. El usuario se registra o inicia sesión → recibe un token
2. El token se envía en el header de peticiones protegidas:
   ```
   Authorization: Bearer <token>
   ```
3. El middleware `auth.js` verifica el token y adjunta el usuario al request

## 🗄️ Modelo de Datos

### Usuario
```json
{
  "name": "Carlos",
  "email": "carlos@test.com",
  "password": "hash_bcrypt"
}
```

### Receta
```json
{
  "titulo": "Pasta a la carbonara",
  "descripcion": "Clásica receta italiana",
  "ingredientes": ["pasta", "huevos", "bacon"],
  "instrucciones": "Hervir la pasta...",
  "imagen": "url_opcional",
  "usuario": "ObjectId_del_usuario"
}
```

## 🧪 Pruebas

### Postman
1. Importar `postman/Recetario.postman_collection.json`
2. Ejecutar el flujo: register → login → CRUD de recetas
3. Las variables `{{token}}` y `{{recipeId}}` se guardan automáticamente

### MongoDB Compass
- Conectar a `mongodb://localhost:27017`
- Base de datos: `recetario`
- Colecciones: `users`, `recipes`

---

## 📚 Documentación

- [Fases de Desarrollo](docs/Fases-de-desarrollo.md) - Plan de aprendizaje
- [Instrucciones de despliegue](docs/instrucciones.md) - Guía de servicios
- [Convenciones de código](docs/convenciones.md) - Nomenclatura
- [Diagramas](docs/diagramas/) - Flujo y casos de uso

## 🚧 Estado del Proyecto

| Fase | Estado |
|------|--------|
| 0 - Preparación del entorno | ✅ |
| 1 - Backend API | ✅ |
| 2 - Frontend (Angular) | 🚧 En desarrollo |
| 3 - Integración y pruebas | ⏳ Pendiente |
| 4 - Finalización | ⏳ Pendiente |
