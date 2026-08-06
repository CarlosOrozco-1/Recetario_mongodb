# 📊 Diagramas de la Aplicación - Recetario

## 🏗️ Diagrama de Arquitectura (Stack MEAN)

```mermaid
graph TD
    subgraph Cliente["Cliente"]
        A["Angular 21<br/>(Frontend)<br/>Puerto 4200"]
    end

    subgraph Servidor["Servidor"]
        B["Express 5<br/>(Backend API)<br/>Puerto 3000"]
    end

    subgraph Datos["Base de Datos"]
        C["MongoDB 8<br/>Puerto 27017"]
    end

    A -->|"HTTP /api/*"| B
    B -->|"mongoose<br/>wire protocol"| C
    A -->|"DevTools/Postman"| B
    C --> B --> A
```

## 🔄 Diagrama de Flujo - Autenticación (Registro/Login)

```mermaid
graph TD
    Inicio([Usuario llega a la app]) --> Ruta{Ruta protegida?}
    Ruta -->|Sí| Guard[AuthGuard]
    Ruta -->|No| LoginV[Vista Login]

    Guard --> Token{¿Token válido?}
    Token -->|Sí| Dashboard[Dashboard]
    Token -->|No| LoginV

    LoginV --> EnviaLogin[Envía email + password<br/>POST /api/auth/login]
    EnviaLogin --> Backend[Express: authController]

    Backend --> Busca{User.findOne}
    Busca -->|No existe| Error1[400 Usuario no encontrado]
    Busca -->|Existe| Compare{verifyPassword<br/>bcrypt.compare}
    Compare -->|Incorrecta| Error2[400 Contraseña incorrecta]
    Compare -->|Correcta| JWT[Generar JWT<br/>expira 30 días]

    JWT --> Respuesta[200 JSON<br/>user + token]
    Respuesta --> SaveLS[Guardar en<br/>localStorage]
    SaveLS --> Dashboard
```

## 📝 Diagrama de Flujo - CRUD de Recetas

```mermaid
graph TD
    Auth[Middleware auth<br/>Bearer Token] --> Valido{¿Token válido?}
    Valido -->|No| 401[401 Token no válido]
    Valido -->|Sí| Route{Operación}

    Route -->|POST /api/recipes| Create[Recipe.create]
    Route -->|GET /api/recipes| GetAll[Recipe.find usuario]
    Route -->|GET /api/recipes/:id| GetOne[Recipe.findOne]
    Route -->|PUT /api/recipes/:id| Update[Recipe.findOneAndUpdate]
    Route -->|DELETE /api/recipes/:id| Delete[Recipe.findOneAndDelete]

    Create --> Crear["{...req.body,<br/>usuario: req.user._id}"]
    GetAll --> Filtro["{usuario: req.user._id}"]
    GetOne --> One["{_id: params.id,<br/>usuario: req.user._id}"]
    Update --> Upd["{_id: params.id,<br/>usuario: req.user._id}"]
    Delete --> Del["{_id: params.id,<br/>usuario: req.user._id}"]

    Crear --> Mongo[(MongoDB<br/>colección recipes)]
    Filtro --> Mongo
    One --> Mongo
    Upd --> Mongo
    Del --> Mongo

    Mongo --> Resp{¿Existe?}
    Resp -->|No| 404[404 Receta no encontrada]
    Resp -->|Sí| Json[200 JSON<br/>201 al crear]
```

## 👥 Casos de Uso del Sistema

```mermaid
graph LR
    subgraph Actor
        U[Usuario]
    end

    subgraph Sistema["Sistema Recetario"]
        Register((Registrar<br/>cuenta))
        Login((Iniciar<br/>sesión))
        Logout((Cerrar<br/>sesión))
        CreateR((Crear<br/>receta))
        ListR((Listar<br/>recetas))
        ViewR((Ver detalle<br/>receta))
        EditR((Editar<br/>receta))
        DeleteR((Eliminar<br/>receta))
    end

    U --- Register
    U --- Login
    U --- Logout
    U --- CreateR
    U --- ListR
    U --- ViewR
    U --- EditR
    U --- DeleteR
```

## 📋 Tabla de Casos de Uso

| # | Caso de Uso | Actor | Descripción | Precondición |
|---|-------------|-------|-------------|--------------|
| 1 | Registrar cuenta | Usuario | Crear cuenta con nombre, email y contraseña | No estar registrado |
| 2 | Iniciar sesión | Usuario | Autenticarse con email y contraseña | Tener cuenta |
| 3 | Cerrar sesión | Usuario | Eliminar token y volver al login | Estar autenticado |
| 4 | Crear receta | Usuario | Agregar receta con título, descripción, ingredientes e instrucciones | Estar autenticado |
| 5 | Listar recetas | Usuario | Ver todas sus recetas | Estar autenticado |
| 6 | Ver detalle | Usuario | Consultar una receta por ID | Estar autenticado |
| 7 | Editar receta | Usuario | Modificar datos de una receta propia | Ser el dueño |
| 8 | Eliminar receta | Usuario | Borrar una receta propia | Ser el dueño |

## 🗂️ Diagrama de la Estructura del Proyecto

```mermaid
graph TD
    Root[recetario/]
    Root --> Backend[backend/]
    Root --> Frontend[frontend/]
    Root --> Docs[docs/]
    Root --> Compose[docker-compose.yml]
    Root --> Postman[postman/]

    Backend --> SrcB[src/]
    SrcB --> Config[config/]
    SrcB --> Controllers[controllers/]
    SrcB --> Middleware[middleware/]
    SrcB --> Models[models/]
    SrcB --> Routes[routes/]
    SrcB --> Server[server.js]

    Controllers --> AC[authController.js]
    Controllers --> RC[recipeController.js]
    Middleware --> AM[auth.js]
    Models --> UM[User.js]
    Models --> RM[Recipe.js]
    Routes --> AR[auth.js]
    Routes --> RR[recipes.js]

    Frontend --> SrcF[src/]
    SrcF --> App[app/]
    App --> Services[services/]
    App --> Guards[guards/]
    Services --> AS[auth.service.ts]
```
