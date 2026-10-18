# Desarrollo local contenerizado

Este entorno sirve para levantar **MongoDB 8, backend y frontend localmente** para desarrollo y pruebas rápidas. La base local queda aislada de Atlas. La primera preparación necesita conexión a Internet para descargar imágenes y dependencias npm; después se puede trabajar sin Atlas ni Internet mientras se conserven las imágenes y los volúmenes.

> El archivo `local/compose.yaml` es exclusivamente local. No es el compose de VPS y no debe copiarse ni usarse como procedimiento de despliegue remoto. El compose remoto usa Caddy y las variables privadas de `backend/.env`.

## Arquitectura

```text
Navegador / Postman
        |
        +-- http://localhost:4200 (Angular dev server)
        |        \
        |         +-- /api -> backend:3000 (proxy Docker)
        |
        +-- http://localhost:3000/api (Postman directo)
                    |
                    +-- mongodb://mongo:27017/recetario_local

MongoDB local: localhost:27017 (solo loopback)
Datos persistentes: volumen Docker recetario-local_mongo-local-data
```

- MongoDB usa la imagen `mongo:8` y un volumen propio, `mongo-local-data`.
- MongoDB solo publica el puerto en `127.0.0.1`, no en interfaces de red externas.
- Backend y frontend de desarrollo usan `node:22-alpine` en sus contenedores (el backend requiere Node 22+ por `multer-gridfs-storage`).
- En Podman/Fedora, el código se monta con etiqueta SELinux privada `:Z`; Docker Desktop/Linux puede usar la misma sintaxis o requerir que se quite `:Z`, según el motor. Las dependencias de `node_modules` viven en volúmenes nombrados.
- La primera instalación ejecuta `npm install` dentro de los bind mounts y puede crear/actualizar `package-lock.json`. Antes de confirmar cambios Git, revisa `git status` y `git diff`; conserva lockfiles si son cambios intencionales y descarta solo artefactos accidentales.
- El backend recibe `MONGODB_URI` local desde el compose; no usa `backend/.env` ni la URI de Atlas en este entorno.
- El secreto JWT del compose es solo para desarrollo local; nunca debe reutilizarse en producción.
- Angular corre con `ng serve` y usa `frontend/src/proxy.docker.conf.json`, que redirige `/api` al servicio `backend`.
- Los volúmenes separados de `node_modules` evitan instalar dependencias dentro de la carpeta fuente.

## Requisitos e instalación en otro equipo

Elige **un solo motor** de contenedores. No hace falta instalar MongoDB en el sistema operativo.

### Fedora / Linux: Podman (opción probada en este equipo)

Instala Podman y el proveedor Compose. En Fedora:

```bash
sudo dnf install podman podman-compose
```

Comprueba que el proveedor está disponible:

```bash
podman --version
podman compose version
```

El servicio Podman rootless debe estar disponible para tu sesión. En Fedora normalmente `podman` funciona sin daemon en modo rootless.

### Docker

- **Linux:** instala Docker Engine y el plugin Docker Compose v2 según la guía oficial de la distribución. Comprueba `docker --version` y `docker compose version`.
- **Windows/macOS:** instala Docker Desktop, que incluye Docker Engine y Docker Compose v2; asegúrate de que Docker Desktop esté iniciado.

Usa el mismo archivo `local/compose.yaml`; solo cambia `podman compose` por `docker compose` en los comandos.

### Requisitos comunes

- Puertos locales `27017`, `3000` y `4200` libres.
- La primera ejecución necesita acceso a Internet para descargar `mongo:8`, `node:22-alpine` e instalar dependencias npm. Después, el stack local no necesita conexión a Atlas ni a Internet si no se cambian dependencias/imágenes y se conservan los volúmenes.
- En Fedora/Podman, el sufijo `:Z` de los bind mounts aplica la etiqueta SELinux privada necesaria. Docker Desktop puede aceptar el sufijo; si el motor de otro sistema lo rechaza, adapta únicamente los bind mounts a la sintaxis soportada por ese motor.

## Iniciar los servicios

Desde la raíz del repositorio, elige el comando según el motor:

```bash
# Podman Compose
podman compose -f local/compose.yaml up -d

# Docker Compose v2
# docker compose -f local/compose.yaml up -d
```

La primera vez, npm instala dependencias en volúmenes separados y puede tardar unos minutos. El compose usa `npm install` porque los paquetes backend/frontend no versionan lockfiles en el repositorio. Ver estado y logs:

```bash
podman compose -f local/compose.yaml ps
podman compose -f local/compose.yaml logs -f mongo backend frontend
```

Con Docker, sustituye `podman compose` por `docker compose`.

El compose ordena el inicio: espera al healthcheck de MongoDB antes de iniciar el backend; luego inicia Angular. No es necesario iniciar `mongo`, backend y frontend manualmente en terminales separadas cuando se usa este compose.

## Probar con Postman

Usa el backend local, no Atlas:

- `baseUrl`: `http://localhost:3000/api`
- Verificación: `GET http://localhost:3000/api/health`
- La respuesta debe indicar `status: "ok"`, `mongodb: "conectado"` y `database: "recetario_local"`.
- Registrar una cuenta local o iniciar sesión con una cuenta creada en esta base. Los usuarios de Atlas no existen automáticamente en la base local.

Para usar la aplicación, abre `http://localhost:4200`. El proxy del frontend redirige las llamadas `/api` al backend del compose.

## Reiniciar, detener y limpiar

Reiniciar sin borrar datos:

```bash
podman compose -f local/compose.yaml restart
# Con Docker: docker compose -f local/compose.yaml restart
```

Detener manteniendo el volumen de MongoDB:

```bash
podman compose -f local/compose.yaml down
# Con Docker: docker compose -f local/compose.yaml down
```

Verificar el health endpoint después de reiniciar:

```bash
curl http://localhost:3000/api/health
```

**Borrar todos los datos locales de prueba** (acción destructiva, solo para la base local):

```bash
podman compose -f local/compose.yaml down -v
# Con Docker: docker compose -f local/compose.yaml down -v
```

`down -v` elimina `mongo-local-data`, además de los volúmenes de dependencias locales; MongoDB empezará vacío la próxima vez. No ejecutar contra el compose de VPS.

## Flujo de trabajo recomendado

1. Desarrollar y probar endpoints contra MongoDB local usando Postman.
2. Reiniciar o detener el compose cuando no se use; los datos permanecen en el volumen.
3. Ejecutar pruebas automatizadas (`npm test`) y revisar el diff.
4. Integrar los cambios en Git según el flujo de ramas del proyecto (ver [`Fases-de-desarrollo.md`](../desarrollo/Fases-de-desarrollo.md)).
5. Desplegar a la VPS solo mediante el procedimiento de [`guia-deploy-vps.md`](./guia-deploy-vps.md), tras validar la rama/commit y los secretos del entorno remoto.

Los registros locales no se copian a Atlas automáticamente. Para conservar una receta de prueba, créala de nuevo de forma deliberada en el entorno que corresponda; no se recomienda migrar la base de pruebas completa a Atlas.

## ¿Hay que levantar Docker al registrar cambios remotos?

No. `git push` solo publica commits en GitHub; no inicia ni modifica contenedores de producción por sí mismo.

- **Pruebas locales:** usa `docker compose -f local/compose.yaml up -d` y la base local.
- **Publicar código:** `git push` actualiza el repositorio remoto, no la VPS.
- **Desplegar en VPS:** es un paso separado. La guía actual es manual: en la VPS se actualiza el checkout de la rama desplegada (`desa`, según `guia-deploy-vps.md`) y se reconstruyen/recrean los servicios backend; el frontend se compila localmente y se transfiere a la VPS por la limitación de RAM. Sigue [`guia-deploy-vps.md`](./guia-deploy-vps.md) y verifica en ella cada paso antes de ejecutarlo. En producción Caddy enruta el dominio y MongoDB apunta a Atlas; no se debe levantar el Mongo local de pruebas.
- No ejecutes `docker compose up` sobre `docker-compose.yml` de la raíz desde el entorno local: requiere la red externa `caddy-central_default` y está destinado a VPS.

> En el flujo actual **push no despliega**: solo actualiza GitHub. La aplicación remota no cambia hasta ejecutar el procedimiento de deploy en la VPS. CI/CD podría automatizarlo en el futuro, pero requiere definir credenciales, validaciones y estrategia de rollback por separado.
