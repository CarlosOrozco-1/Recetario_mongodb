# GridFS e índices

## Colecciones de GridFS

Las imágenes se guardan en el bucket `uploads`, no como documentos Mongoose.

### `uploads.files`

| Campo | Tipo | Significado |
|---|---|---|
| `_id` | `ObjectId` | Identificador usado en `Recipe.imagen` |
| `length` | `Number` | Tamaño total del archivo en bytes |
| `chunkSize` | `Number` | Tamaño de cada fragmento |
| `uploadDate` | `Date` | Fecha de subida |
| `filename` | `String` | Nombre generado con marca temporal |
| `metadata.usuario` | `ObjectId` | Propietario que subió la imagen |
| `metadata.contentType` | `String` | Tipo MIME guardado durante la subida |

El servicio de imágenes también acepta campos heredados `contentType` o deduce el tipo por extensiones `.jpg`, `.jpeg`, `.png`, `.webp` y `.gif`.

### `uploads.chunks`

| Campo | Tipo | Significado |
|---|---|---|
| `_id` | `ObjectId` | Clave primaria generada por MongoDB |
| `files_id` | `ObjectId` | Referencia al archivo correspondiente |
| `n` | `Number` | Orden del fragmento |
| `data` | `Binary` | Fragmento binario del archivo |

## Índices actuales

| Colección | Índice |
|---|---|
| `users` | `email`, único |
| `comments` | `{ receta: 1, createdAt: -1 }` |
| `comments` | `{ usuario: 1, createdAt: -1 }` |
| `comments` | `{ parentComment: 1 }` |
| `reviews` | `{ usuario: 1, receta: 1 }`, único |
| `reviews` | `{ receta: 1, puntuacion: 1 }` |
| `follows` | `{ seguidor: 1, seguido: 1 }`, único |
| `follows` | `{ seguido: 1, createdAt: -1 }` |
| `follows` | `{ seguidor: 1, createdAt: -1 }` |
| `activityfeeds` | `{ usuario: 1, createdAt: -1 }` |

## Índices recomendados pendientes

- `recipes`: `{ usuario: 1, createdAt: -1 }` para el tablero personal.
- `recipes`: `{ publica: 1, createdAt: -1 }` para el listado público.
- `notifications`: `{ destinatario: 1, leida: 1, createdAt: -1 }`.
