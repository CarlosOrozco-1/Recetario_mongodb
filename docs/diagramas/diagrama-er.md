# 🗄️ Diagrama Entidad-Relación (ER) - Colecciones

**Última revisión:** 2026-09-26
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
    USER }o--o{ RECIPE : "likes"
    USER }o--o{ RECIPE : "guardados"
    USER }o--o{ RECIPE : "favoritos"
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
        Number favoritosCount
        ObjectIdArray favoritos FK
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
        Boolean favorito
        Boolean publica
        ObjectId usuario FK
        ObjectIdArray likes FK
        Number likesCount
        ObjectIdArray guardados FK
        Number guardadosCount
        Number comentariosCount
        Number ratingPromedio
        Number ratingCount
        Number compartidosCount
        StringArray hashtags
        Boolean reportado
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
| `Recipe.likes[]` → `User` | N : N | Array de `ObjectId` | Contador `likesCount` |
| `Recipe.guardados[]` → `User` | N : N | Array de `ObjectId` | Contador `guardadosCount` |
| `User.favoritos[]` → `Recipe` | N : N | Array de `ObjectId` | Contador `favoritosCount` |
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
| `User` | `{ email }` **unique** | Login sin duplicados |

**Índices que faltan:** `Recipe` no tiene índice para la lista del dashboard
(`{ usuario: 1, createdAt: -1 }`) ni para las públicas (`{ publica: 1, createdAt: -1 }`),
y `Notification` aún no existe.

## Enumeraciones

| Campo | Valores |
|---|---|
| `Recipe.dificultad` | `Fácil`, `Media`, `Difícil` |
| `ActivityFeed.tipo` | `creo_receta`, `comento_receta`, `reseno_receta`, `likio_receta`, `guardo_receta`, `siguio_usuario` |
| `ActivityFeed.referencia.tipo` | `Recipe`, `Comment`, `Review`, `User` |
| `Notification.tipo` (propuesto) | `like`, `comment`, `reply`, `follow`, `review`, `share` |

## Notas

- **`Recipe.imagen` es `String`, no `ObjectId`.** Guarda el `_id` de
  `uploads.files`, con el que se construye `/api/recipes/image/:fileId`. Es la
  única relación que no usa `ref` y por eso se marca como texto libre.
- **Contadores desnormalizados.** `likesCount`, `guardadosCount`,
  `comentariosCount`, `ratingPromedio`, `ratingCount` y `compartidosCount` viven
  en `Recipe` para no recorrer arrays en cada consulta. Si se recalculan mal,
  el número miente aunque el array `likes[]` sea correcto.
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
- [ ] Añadir los índices que faltan de `Recipe`
- [ ] Convertir este diagrama en la especificación de detalle (Fase 8),
      con el ejemplo de documento de cada colección
