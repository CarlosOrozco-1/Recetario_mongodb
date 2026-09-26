# Bitácora de Errores y Correcciones

## Formato
Cada entrada incluye: **Fecha**, **Componente/Archivo**, **Síntoma**, **Causa Raíz**, **Solución Aplicada**, **Verificación**.

---

## 2026-08-18 | recipe-form (Edición de receta no muestra datos)

### Síntoma
Al editar una receta existente, el formulario mostraba los valores por defecto (vacíos/"datos de ejemplo") en lugar de los datos de la receta. En consola el log `"Modelo de receta asignado en el formulario:"` mostraba el objeto correcto con todos los campos poblados desde el backend.

### Causa Raíz
Falta de detección de cambios (change detection) en Angular. El callback `subscribe()` de `HttpClient` asignaba correctamente `this.recipe = {...}`, pero el template no se actualizaba. Posibles razones:
- El componente o un ancestro usa estrategia `OnPush`
- `zone.js` no detectó la actualización dentro del callback
- Race condition en la navegación

### Solución Aplicada
1. Inyectar `ChangeDetectorRef` en el componente
2. Llamar a `this.cdr.detectChanges()` tras asignar `this.recipe` en el `next()` del `subscribe()`

**Archivo:** `frontend/src/app/components/recipe-form/recipe-form.ts`

```typescript
// Import
import { ChangeDetectorRef } from "@angular/core";

// Inyección
private readonly cdr = inject(ChangeDetectorRef);

// En loadRecipe()
next: (data) => {
  this.recipe = { /* ... asignación ... */ };
  this.cdr.detectChanges(); // Fuerza actualización del template
},
```

### Verificación
- `ng build` → compila sin errores
- Al editar una receta, el formulario ahora muestra los datos correctos (título, descripción, ingredientes, instrucciones, categoría, dificultad, tiempo, porciones, pública, favorito)

---

## 2026-08-18 | Language Server Angular (Zed) - Módulo no encontrado en raíz

### Síntoma
Error al iniciar Zed: `Cannot find module '/home/carloso/Projects/2026/MAIN/recetario/node_modules/@angular/language-server/index.js'`. El editor buscaba el language server en la raíz del workspace, pero estaba instalado solo en `frontend/node_modules`.

### Causa Raíz
El workspace root es `recetario/` pero el proyecto Angular vive en `frontend/`. VSCode/Zed resuelven `@angular/language-server` desde el workspace root.

### Solución Aplicada
1. Crear `package.json` en la raíz (`recetario/`) con `@angular/language-server`, `@angular/language-service` y `typescript` como devDependencies
2. `npm install` en la raíz → crea `recetario/node_modules/@angular/language-server/`
3. Corregir `.zed/settings.json`: mover configuración del binario a sección `"lsp"` y usar array de strings en `"language_servers"`
4. Desactivar Biome para HTML: `"formatter": "language_server"`, `"linter": "language_server"`

**Archivos:**
- `package.json` (raíz) - nuevo
- `.zed/settings.json` - corregido

### Verificación
- Language server arranca con `EXIT: 0`
- Error "Text expressions aren't supported" (Biome) → desaparece
- Error "Alternative text title element cannot be empty" → persiste (es warning real de a11y del Angular Language Service)

---

## 2026-08-18 | recipe-form - Pérdida de foco en inputs de ingredientes

### Síntoma
Al escribir en los campos de ingredientes (`*ngFor`), cada carácter hacía perder el foco del input.

### Causa Raíz
`*ngFor` sobre array de strings sin `trackBy`. Cada keystroke muta el string → Angular detecta "nuevo objeto" por referencia → destruye y recrea el DOM del input → se pierde el foco.

### Solución Aplicada
Agregar `trackBy: trackByIndex` al `*ngFor` y método `trackByIndex(index) { return index; }` en el componente.

**Archivos:**
- `frontend/src/app/components/recipe-form/recipe-form.html` (línea 98)
- `frontend/src/app/components/recipe-form/recipe-form.ts` (método `trackByIndex`)

### Verificación
- Al escribir en ingredientes, el foco se mantiene correctamente
- `ng build` → OK

---

## 2026-08-18 | Login/Register - "Text expressions aren't supported" + errores a11y

### Síntoma
En Zed: errores "Text expressions aren't supported" en plantillas Angular (`{{ }}`, `*ngIf`, etc.) y warnings de accesibilidad (`<a routerLink>` sin `href`, `<button>` sin `type`).

### Causa Raíz
1. Biome (linter por defecto de Zed para HTML) no parsea sintaxis Angular
2. Falta `type="button"` en botones sin submit
3. Falta `href` en `<a routerLink>` (regla a11y `linkHref`)

### Solución Aplicada
1. Configurar Zed para usar Angular Language Service como formatter/linter: `"formatter": "language_server"`, `"linter": "language_server"` en `.zed/settings.json`
2. Agregar `type="button"` a todos los botones que no son submit
3. Agregar `href` a enlaces con `routerLink`

**Archivos corregidos:**
- `frontend/src/app/components/login/login.html`
- `frontend/src/app/components/register/register.html`
- `frontend/src/app/components/recipe-form/recipe-form.html`
- `frontend/src/app/components/dashboard/dashboard.html`

### Verificación
- Build Angular OK
- Errores Biome desaparecidos
- Warnings a11y resueltos

---

## 2026-08-17 | Postman Collection - JSON inválido

### Síntoma
La colección Postman tenía JSON malformado (faltaban llaves de cierre en los objetos de request).

### Causa Raíz
Edición manual incompleta al agregar endpoints de recetas.

### Solución Aplicada
Corregir estructura JSON: cerrar todos los objetos `request` y `response` correctamente, validar con `jq`.

**Archivo:** `postman/Recetario.postman_collection.json`

### Verificación
- `jq empty postman/Recetario.postman_collection.json` → sin errores
- Importación en Postman exitosa
- Tests de Health, Auth (register/login), Recipes CRUD → pasan

---

## 2026-08-17 | Backend - Health endpoint sin estado de MongoDB

### Síntoma
Endpoint `GET /api/health` no indicaba si MongoDB estaba conectado.

### Causa Raíz
Endpoint básico solo devolvía `{status: "ok"}`.

### Solución Aplicada
Mejorar `GET /api/health` para incluir estado de conexión Mongoose:
```javascript
{
  status: "ok",
  mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  database: mongoose.connection.name,
  host: mongoose.connection.host,
  port: mongoose.connection.port,
  timestamp: new Date().toISOString()
}
```

**Archivo:** `backend/src/server.js`

### Verificación
- `curl http://localhost:3000/api/health` muestra estado completo
- Docker healthcheck usa este endpoint

---

## 2026-08-17 | Backend - Recipe model `usuario` como String en vez de ObjectId

### Síntoma
Al crear recetas, el campo `usuario` se guardaba como string plano en vez de referencia ObjectId, rompiendo el `populate()`.

### Causa Raíz
Schema definía `usuario: { type: String }` en vez de `type: mongoose.Schema.Types.ObjectId, ref: "User"`.

### Solución Aplicada
Corregir Schema en `Recipe.js`:
```javascript
usuario: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
}
```

**Archivo:** `backend/src/models/Recipe.js`

### Verificación
- `populate("usuario", "name")` funciona en `getAll` y `getById`
- Recetas muestran nombre del chef correctamente

---

## 2026-08-17 | Naming Conventions - Archivos controllers/routes

### Síntoma
Inconsistencia: `RecipeController.js` (PascalCase) vs `authController.js` (camelCase), `Recipes.js` vs `recipes.js`.

### Causa Raíz
Convenciones no documentadas al inicio del proyecto.

### Solución Aplicada
1. Documentar convenciones en `docs/convenciones.md`
2. Renombrar archivos a camelCase:
   - `RecipeController.js` → `recipeController.js`
   - `Recipes.js` → `recipes.js`
   - `AuthController.js` → `authController.js` (ya estaba)
3. Ajustar imports en `server.js` y rutas

**Archivos:**
- `docs/convenciones.md` - nuevo
- `backend/src/controllers/*.js` - renombrados
- `backend/src/routes/*.js` - renombrados
- `backend/src/server.js` - imports actualizados

### Verificación
- Todas las rutas funcionan
- Consistencia en todo el backend

---

## 2026-08-16 | Frontend - `.toPromise()` deprecado en RxJS 7.8+

### Síntoma
Error de compilación: `Property 'toPromise' does not exist on type 'Observable'`.

### Causa Raíz
RxJS 7.8+ eliminó `.toPromise()`. Se debe usar `firstValueFrom()` o `lastValueFrom()`.

### Solución Aplicada
Reemplazar `.toPromise()` por `firstValueFrom()` en:
- `login.component.ts`
- `register.component.ts`
- `recipe-form.component.ts`
- `dashboard.component.ts`

Importar: `import { firstValueFrom } from "rxjs";`

### Verificación
- `ng build` compila sin errores
- Login, registro, CRUD recetas funcionan

---

## 2026-08-16 | Frontend - `CommonModule` faltante en componentes standalone

### Síntoma
Error: `NG0302: The pipe 'async' could not be found` / directivas `*ngIf`, `*ngFor` no reconocidas.

### Causa Raíz
Componentes standalone no importaban `CommonModule`.

### Solución Aplicada
Agregar `CommonModule` a `imports[]` en todos los componentes standalone que usan `*ngIf`, `*ngFor`, `async`, `date` pipe, etc.

### Verificación
- Compilación OK
- Templates renderizan correctamente

---

## 2026-08-15 | Docker - Frontend nginx config para proxy API

### Síntoma
Frontend en Docker no llegaba al backend (`/api/*` → 404).

### Causa Raíz
Faltaba configuración de proxy en nginx del frontend.

### Solución Aplicada
Crear `frontend/nginx.conf` con:
```nginx
location /api/ {
  proxy_pass http://backend:3000/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}
```

Actualizar `Dockerfile.frontend` para copiarlo.

### Verificación
- `docker compose up` → frontend accede a `/api/*` via proxy
- Login, registro, recetas funcionan en contenedores

---

*Última actualización: 2026-08-18*
---

## 2026-09-25 | Deploy VPS (contenedor crasheado por whitelist de Atlas)

### Síntoma
En la VPS el contenedor `recetario-backend` arrancaba y se caía de inmediato:

```
🚀 Backend corriendo en puerto 3000
❌ Error de conexión a MongoDB: Could not connect to any servers in your MongoDB
   Atlas cluster. One common reason is that you're trying to access the database
   from an IP that isn't whitelisted.
[nodemon] app crashed - waiting for file changes before starting...
```

Desde Caddy: `wget: can't connect to remote host (172.20.0.3): Connection refused`

### Causa Raíz
**No era un problema de red ni de Caddy.** Dos confusiones se mezclaban:

1. La IP pública de la VPS (`161.153.28.223`) no estaba en la **IP Access List** del
   cluster de Atlas. Solo estaba la IP de la máquina de desarrollo, por eso en local
   sí conectaba.
2. Al estar la app caída, el `Connection refused` de Caddy era el síntoma correcto,
   no la causa. El contenedor sí estaba en la red correcta (`caddy-central_default`)
   y Caddy sí resolvía el nombre a `172.20.0.3`.

Error de diagnóstico asociado: `docker stats` reportaba **22 PIDs**, lo que sugería
un loop de reinicios. Era una falsa alarma: `docker stats` cuenta hilos, y `docker top`
mostró solo 3 procesos reales (`npm` → `nodemon` → `node`).

### Solución Aplicada
1. Atlas → Network Access → Add IP Address → `161.153.28.223/32`
2. `docker compose restart backend`
3. Verificación desde la red de Caddy:
   `docker exec caddy-central-caddy-1 wget -qO- http://recetario-backend:3000/api/health`

**Resultado:** `{"status":"ok","mongodb":"conectado","database":"recetario",...}`

### Verificación
El test válido es **desde dentro de la red de Caddy**, porque ese es el origen real
del tráfico. `curl localhost:3000` desde el host falla siempre que el servicio no
publique puertos, y eso es intencional.

**Documentación:** `docs/guia-deploy-vps.md` (sección 5, Troubleshooting)

---

## 2026-09-25 — Las imágenes no se veían en el navegador

**Síntoma:** la receta cargaba bien (título, descripción, imagen en la tarjeta) pero
la foto no aparecía; se veía el texto `alt`.

**Diagnóstico:** no era un problema de calidad ni de formato de imagen (la primera
sospecha fue base64, que **no** lo arregla). Eran cuatro bugs encadenados:

1. **Ruta bajo JWT.** `backend/src/routes/recipes.js` tenía
   `router.use(auth)` en la línea 19, y la ruta `GET /image/:fileId` estaba
   *debajo*. El navegador pide las imágenes con `<img src>`, y ese tipo de
   petición **no puede enviar la cabecera `Authorization`**, así que Express
   respondía 401 y nunca se pintaba el binario.
   → La ruta se movió **antes** de `router.use(auth)`. Es público a propósito:
   las fotos de recetas no son un secreto, y los ObjectId de GridFS no se
   enumeran.

2. **Variable de entorno distinta.** `upload.js` leía `process.env.MONGO_URI`,
   pero `docker-compose.yml` define `MONGODB_URI`. `multer-gridfs-storage`
   fallaba al inicializar. → Ahora `MONGODB_URI || MONGO_URI`, igual que
   `server.js`.

3. **Validación imposible.** `sharp(req.file.buffer)` no puede funcionar: con
   `multer-gridfs-storage` el archivo se escribe por streaming a GridFS y nunca
   existe `req.file.buffer`. → Se eliminó el middleware y la dependencia nativa
   `sharp` (~40 MB); la comprobación de dimensiones se hizo en el cliente con
   `new Image()`, que sí tiene los bytes en memoria.

4. **Método HTTP equivocado.** El frontend llamaba
   `this.http.put('/api/recipes/:id/image')` pero el backend solo declaraba
   `POST /:id/image`. El 404 era silencioso. → `http.post`.

**Por qué no base64:** el 401 se produce *antes* de leer el cuerpo de la
respuesta, así que ningún cambio de formato lo evita. Además.base64 en el
documento de la receta traería tres problemas nuevos: 5 MB de imagen se
convierten en ~6.7 MB de texto (MongoDB corta en 16 MB por documento), cada
`GET /api/recipes` devolvería megabytes, y la imagen perdería su caché
independiente en el navegador.

## 2026-09-25 — Mass-assignment en la actualización de recetas

**Síntoma:** detectado al revisar por qué la casilla "pública" obligaba a reentrar
al editor.

**Diagnóstico:** `recipeController.update` pasaba `req.body` **completo** a
`Recipe.findOneAndUpdate`. Un `PUT` con `{"usuario": "<id de otro>"}` transfería
la receta a otro usuario, y `{"likesCount": 9999, "reportes": [...]}` falseaba
las métricas sociales. El frontend ya provocaba esto sin querer: `toggleFavorite`
mandaba la receta entera (`{ ...cleanRecipe, favorito }`).

**Solución:** allowlist `EDITABLE_FIELDS` (12 campos) aplicada en `create` y en
`update`, con `runValidators: true` y un `400` si no llega ningún campo editable.
`toggleFavorite` ahora envía solo `{ favorito }`.

**Bonus:** la misma sesión añadió el toggle de visibilidad pedido — el badge
"🔓 Pública / 🔒 Privada" es un botón, tanto en la tarjeta como en el modal de
detalle, y abre un modal de confirmación antes de aplicar el cambio.

**Verificación:** `npm test` en `backend/` (10 casos con `node:test`, sin
framework externo) cubre el orden de las capas del router —que la imagen siga
siendo pública y todo lo demás no— y la allowlist de campos. Añadido como
`npm test` en `backend/package.json`.

## 2026-09-26 — El botón de privacidad se veía pero no respondía

**Síntoma:** el badge "🔓 Pública / 🔒 Privada" aparecía en la tarjeta y en el
modal de detalle, con el aspecto de un botón, pero al pulsarlo no pasaba nada:
había que editar la receta y marcar la casilla.

**Causa:** `.card-badges-top` declara `pointer-events: none` para que la imagen
de debajo de la tarjeta siga siendo clicable. Los hijos interactivos lo
revirtieron con `pointer-events: auto`, uno a uno: `.favorite-star-btn` y
`.social-btn` lo tienen, `.privacy-badge` no.

El badge era un `<span>` cuando se diseñó el contenedor, así que no necesitaba
recibir eventos. Al convertirlo en `<button>` en un cambio anterior, se olvidó
reactivarlos: el elemento pasó a ser clicable en apariencia y a seguir siendo
inerte en la práctica.

**Solución:** `pointer-events: auto` en `button.privacy-badge`.

**Lección sobre los tests:** la suite de plantillas comprobaba el HTML y el
z-index del modal, y ambos estaban bien. El fallo estaba en el CSS, que nadie
miraba. Se añadieron dos casos que verifican que todo botón dentro de un
contenedor con `pointer-events: none` declara su propio `auto`.

## 2026-09-26 — Almacenamiento de Atlas (500 MB) y compresión de imágenes

El plan M0 da 500 MB. Subiendo fotos tal cual, del móvil, el margen es corto:
una imagen de 3000x2000 en JPEG ronda los 2,4 MB.

| Estrategia | Peso por imagen | Imágenes en 500 MB |
|-----------|------------------|---------------------|
| Sin redimensionar | ~2,4 MB | ~212 |
| Con redimensionado | ~186 KB | ~2.746 |

Medido sobre una imagen de 3000x2000: pasarla por 1600 px de lado mayor y JPEG
calidad 0,8 la deja en 186 KB, **12,9 veces más pequeña**.

Por eso `recipe-form.ts` ahora redimensiona en el navegador con `canvas` antes
de subir, sustituyendo el aviso de dimensiones que solo informaba. Si el
navegador no puede exportar, se sube el original como recurso.

**Aviso:** el límite de 5 MB del servidor sigue vigente como red de seguridad,
pero la app ya no se acerca a él. En una demostración universitaria el margen
es amplio; conviene no subir rafjes de video ni originales sin retocar.

## 2026-09-26 — La imagen de una receta no se sustituía al guardar

**Síntoma:** al editar una receta que ya tenía foto, se elegía un archivo nuevo,
se veía la vista previa y al guardar los cambios la imagen se quedaba igual.

**Causa:** el botón de subida se ocultaba con
`*ngIf="selectedFile && !recipe.imagen"`. Al existir ya una imagen, la condición
era falsa y el botón no se renderizaba nunca. La "vista previa" es un `blob:`
creado en el navegador con `URL.createObjectURL`, no el fichero subido: daba la
impresión de haberlo enviado, pero la petición nunca salía. Al guardar se
reenviaba el `imagen` antiguo y el backend lo aceptaba con normalidad, por eso
la API respondía 200 y no se veía ningún error.

Enlazado con ello, `removeImage()` solo limpiaba la vista previa, no
`recipe.imagen`. Aun sin subir nada, "Guardar cambios" repone la imagen.

**Solución:** mostrar el botón con cualquier archivo pendiente y etiquetarlo
"Reemplazar imagen" cuando ya existe una; vaciar `recipe.imagen` al eliminar;
soltar `selectedFile` tras subir para que el botón no reaparezca.

**Limpieza en GridFS:** `update` ahora borra la imagen anterior cuando esta
cambia o se quita. Hay que leerla *antes* de actualizar: con
`returnDocument: "after"` el documento devuelto ya trae el valor nuevo, así que
compararlo contra `changes.imagen` no detectaba nunca el cambio y el fichero
se quedaba huérfano. La primera versión del arreglo tenía justo ese fallo; la
prueba E2E lo destapó (la imagen respondía 200 tras "quitarla").

Comprobado contra Atlas: sustituir deja la receta con el id nuevo, la imagen
antigua responde 404, quitarla también la borra y no deja ficheros huérfanos.
