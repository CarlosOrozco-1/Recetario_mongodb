# 🗄️ Diagrama Entidad-Relación (ER) - Colecciones

**Última revisión:** 2026-10-17
**Fuente:** `backend/src/models/*.js` + colecciones GridFS de `uploads`
**Base de datos:** MongoDB 8 (`recetario`)

> Este diagrama refleja los **modelos reales** del código, no la intención de un
> documento previo. Si un campo no está aquí, no existe en el schema.

## Diagrama

![Diagrama Entidad-Relación de las colecciones](./diagrama-er.svg)

<details>
<summary>Código Mermaid (editable)</summary>

```mermaid
%%{init: {"htmlLabels": false}}%%
erDiagram
    USER ||--o{ RECIPE : "crea (usuario)"
    USER ||--o{ COMMENT : "escribe (usuario)"
    USER ||--o{ REVIEW : "resena (usuario)"
    USER ||--o{ FOLLOW : "seguidor"
    USER ||--o{ FOLLOW : "seguido"
    USER ||--o{ ACTIVITY_FEED : "genera (usuario)"
    USER ||--o{ LIKE : "usuario"
    RECIPE ||--o{ LIKE : "receta"
    USER ||--o{ SAVE : "usuario"
    RECIPE ||--o{ SAVE : "receta"
    USER ||--o{ REPORT : "usuario"
    RECIPE ||--o{ REPORT : "receta"
    RECIPE ||--o{ COMMENT : "recibe (receta)"
    RECIPE ||--o{ REVIEW : "recibe (receta)"
    COMMENT ||--o{ COMMENT : "responde (parentComment)"
    RECIPE ||--o| UPLOADS_FILES : "imagen (string id)"
    UPLOADS_FILES ||--o{ UPLOADS_CHUNKS : "contiene (files_id)"
    USER ||--o{ NOTIFICATION : "destinatario"
    USER ||--o{ NOTIFICATION : "actor"

    USER {
        ObjectId _id PK
        String name
        String email UK
        String password
        String avatar
        String bio
        Number recetasCount
        Number seguidoresCount
        Number siguiendoCount
        Date createdAt
        Date updatedAt
    }

    RECIPE {
        ObjectId _id PK
        String titulo
        String descripcion
        StringArray ingredientes
        String instrucciones
        String imagen FK
        String categoria
        Number tiempoPreparacion
        String dificultad
        Number porciones
        Boolean publica
        ObjectId usuario FK
        Number likesCount
        Number guardadosCount
        Number comentariosCount
        Number ratingPromedio
        Number ratingCount
        Number compartidosCount
        StringArray hashtags
        Date createdAt
        Date updatedAt
    }

    LIKE {
        ObjectId _id PK
        ObjectId usuario FK
        ObjectId receta FK
        Date createdAt
        Date updatedAt
    }

    SAVE {
        ObjectId _id PK
        ObjectId usuario FK
        ObjectId receta FK
        Date createdAt
        Date updatedAt
    }

    REPORT {
        ObjectId _id PK
        ObjectId usuario FK
        ObjectId receta FK
        String motivo
        String estado
        Date createdAt
        Date updatedAt
    }

    COMMENT {
        ObjectId _id PK
        String texto
        ObjectId usuario FK
        ObjectId receta FK
        ObjectId parentComment FK
        Boolean eliminado
        Date createdAt
        Date updatedAt
    }

    REVIEW {
        ObjectId _id PK
        ObjectId usuario FK
        ObjectId receta FK
        Number puntuacion
        String texto
        Date createdAt
        Date updatedAt
    }

    FOLLOW {
        ObjectId _id PK
        ObjectId seguidor FK
        ObjectId seguido FK
        Date createdAt
        Date updatedAt
    }

    ACTIVITY_FEED {
        ObjectId _id PK
        ObjectId usuario FK
        String tipo
        String referenciaTipo
        ObjectId referenciaId
        String recetaTitulo
        String autorNombre
        Date createdAt
        Date updatedAt
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId destinatario FK
        ObjectId actor FK
        String tipo
        ObjectId recurso
        Boolean leida
        Date createdAt
        Date updatedAt
    }

    UPLOADS_FILES {
        ObjectId _id PK
        Number length
        Number chunkSize
        Date uploadDate
        String filename
        String contentType
    }

    UPLOADS_CHUNKS {
        ObjectId _id PK
        ObjectId files_id FK
        Number n
        Buffer data
    }
```

</details>

> El `%%{init}%%` fuerza etiquetas SVG en vez de `<foreignObject>`. GitHub
> elimina `foreignObject` por seguridad y el diagrama sale en blanco.

## Colecciones y modelos

| Colección | Modelo | Estado |
|---|---|---|
| `users` | `User.js` | ✅ En uso |
| `recipes` | `Recipe.js` | ✅ En uso |
| `comments` | `Comment.js` | ✅ En uso |
| `reviews` | `Review.js` | ✅ En uso |
| `follows` | `Follow.js` | ✅ En uso |
| `activityfeeds` | `ActivityFeed.js` | ✅ En uso |
| `likes` | `Like.js` | ✅ En uso |
| `saves` | `Save.js` | ✅ En uso |
| `reports` | `Report.js` | ✅ En uso |
| `notifications` | `Notification.js` | 🚧 **No implementado** (Fase 7) |
| `uploads.files` | GridFSBucket | ✅ En uso |
| `uploads.chunks` | GridFSBucket | ✅ En uso |

## Relaciones

| Relación | Cardinalidad | Implementación | Borrado |
|---|---|---|---|
| `Recipe.usuario` → `User` | N recetas : 1 usuario | `ObjectId` + `ref` | Requerido (huérfano si se borra el usuario) |
| `Comment.usuario` → `User` | N : 1 | `ObjectId` + `ref` | Requerido |
| `Comment.receta` → `Recipe` | N : 1 | `ObjectId` + `ref` | Requerido |
| `Comment.parentComment` → `Comment` | N : 1 (auto) | `ObjectId` + `ref` | `null` si es de primer nivel |
| `Review.usuario`/`Review.receta` | N : 1 cada uno | `ObjectId` + `ref` | Par único |
| `Follow.seguidor`/`Follow.seguido` | N : 1 cada uno | `ObjectId` + `ref` | Par único |
| `Like.usuario` → `User` | N : 1 | `ObjectId` + `ref` | Par `usuario`+`receta` único |
| `Like.receta` → `Recipe` | N : 1 | `ObjectId` + `ref` | Contador `Recipe.likesCount` |
| `Save.usuario` → `User` | N : 1 | `ObjectId` + `ref` | Par `usuario`+`receta` único |
| `Save.receta` → `Recipe` | N : 1 | `ObjectId` + `ref` | Contador `Recipe.guardadosCount` |
| `Report.usuario` → `User` | N : 1 | `ObjectId` + `ref` | Par `usuario`+`receta` único |
| `Report.receta` → `Recipe` | N : 1 | `ObjectId` + `ref` | Estado `pendiente`/`descartado`/`resuelto` |
| `ActivityFeed.referencia` | Polimórfica | `{ tipo, id }` | Sin `ref` real |
| `Recipe.imagen` → `uploads.files` | 1 : 0..1 | `String` con el `_id` de GridFS | Se limpia al borrar/sustituir |

## Índices declarados

| Colección | Índice | Para qué |
|---|---|---|
| `Comment` | `{ receta: 1, createdAt: -1 }` | Comentarios de una receta ordenados |
| `Comment` | `{ usuario: 1, createdAt: -1 }` | Comentarios de un usuario |
| `Comment` | `{ parentComment: 1 }` | Respuestas a un comentario |
| `Review` | `{ usuario: 1, receta: 1 }` **unique** | Una reseña por usuario y receta |
| `Review` | `{ receta: 1, puntuacion: 1 }` | Calcular promedio |
| `Follow` | `{ seguidor: 1, seguido: 1 }` **unique** | No seguir dos veces |
| `Follow` | `{ seguido: 1, createdAt: -1 }` | Listar seguidores |
| `Follow` | `{ seguidor: 1, createdAt: -1 }` | Listar seguidos |
| `ActivityFeed` | `{ usuario: 1, createdAt: -1 }` | Feed paginado |
| `Like` | `{ usuario: 1, receta: 1 }` **unique** | Un “me gusta” por usuario y receta |
| `Like` | `{ receta: 1 }` | Conteo por receta |
| `Save` | `{ usuario: 1, receta: 1 }` **unique** | Un guardado por usuario y receta |
| `Save` | `{ receta: 1 }` | Conteo por receta |
| `Report` | `{ usuario: 1, receta: 1 }` **unique** | Un reporte por usuario y receta |
| `Report` | `{ receta: 1, estado: 1 }` | Consultas de moderación |
| `Recipe` | `{ usuario: 1, createdAt: -1 }` | Tablero personal |
| `Recipe` | `{ categoria: 1 }` | Filtro por categoría |
| `Recipe` | `{ publica: 1 }` | Listado público |
| `User` | `{ email }` **unique** | Login sin duplicados |

**Índices que faltan:** solo `Notification`, que aún no existe.

## Enumeraciones

| Campo | Valores |
|---|---|
| `Recipe.dificultad` | `Fácil`, `Media`, `Difícil` |
| `Report.estado` | `pendiente`, `descartado`, `resuelto` |
| `ActivityFeed.tipo` | `creo_receta`, `comento_receta`, `reseno_receta`, `likio_receta`, `guardo_receta`, `compartio_receta`, `siguio_usuario` |
| `ActivityFeed.referencia.tipo` | `Recipe`, `Comment`, `Review`, `User` |
| `Notification.tipo` (propuesto) | `like`, `comment`, `reply`, `follow`, `review`, `share` |

## Notas

- **`Recipe.imagen` es `String`, no `ObjectId`.** Guarda el `_id` de
  `uploads.files`, con el que se construye `/api/recipes/image/:fileId`. Es la
  única relación que no usa `ref` y por eso se marca como texto libre.
- **Contadores desnormalizados.** `likesCount`, `guardadosCount`,
  `comentariosCount`, `ratingPromedio`, `ratingCount` y `compartidosCount` viven
  en `Recipe` para no recorrer colecciones en cada consulta. Si se recalculan
  mal, el número miente aunque las colecciones `likes`/`saves` sean correctas.
- **`ActivityFeed` es un log, no notificaciones.** Registra acciones de forma
  pública y desnormaliza `recetaTitulo`/`autorNombre`. La Fase 7 añadirá
  `Notification`, que sí tiene `destinatario` y `leida`.
- **GridFS.** `uploads.files` guarda los metadatos y `uploads.chunks` los trozos
  de 255 KB. `contentType` vive dentro de `metadata` en el documento real; aquí
  se aplana para que quepa en el diagrama.
- **`Follow` evita auto-seguir** con un `pre("validate")`, y `Review` y `Follow`
  tienen índice único por pareja. No hay borrado en cascada: borrar un `User`
  dejaría sus recetas y comentarios huérfanos.

## Pendiente

- [ ] Cuando se implemente `Notification` (Fase 7), quitar la marca de "no
      implementado" y confirmar sus índices
- [ ] Convertir este diagrama en la especificación de detalle (Fase 8),
      con el ejemplo de documento de cada colección
