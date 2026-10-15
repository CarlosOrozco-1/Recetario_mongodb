# DERCAS en LaTeX

Este directorio contiene el Documento de Especificación de Requerimientos para el Análisis y Diseño del Sistema (DERCAS) del proyecto FoodLoop.

## Estructura

El documento sigue el modelo de referencia de 12 secciones:

1. Definiciones, acrónimos y abreviaturas.
2. Descripción del sistema solicitado.
3. Definición de actores.
4. Procesos a sistematizar.
5. Diagrama de flujo de los procesos.
6. Casos de uso.
7. Diagrama de secuencia.
8. Diagramas de estado.
9. Diagrama ER.
10. Requerimientos no funcionales (autenticación y autorización, seguridad de datos, almacenamiento e integración).
11. Planificación de ciclos de desarrollo.
12. Firmas de aceptación.

## Archivos fuente

- `dercas.tex`: documento principal.
- `capitulos/`: capítulos del documento (`01-definiciones` a `12-firmas`).
- `diagramas/`: carpeta de diagramas del documento (SVG organizados en `flujo/`, `casos-uso/`, `secuencia/`, `estado/` y `diagrama-er.svg`). De aquí se toman las imágenes del PDF.
- `build/`: salida generada y figuras convertidas; no se versiona.

Las fuentes Mermaid editables (`.md`) para ver en Zed se mantienen aparte en `../diagramas/`; al regenerarlas, los `.svg` se copian a `diagramas/` para que entren al PDF.

## Compilar el PDF

La forma recomendada no requiere permisos de administrador:

```bash
cd docs/dercas
make
```

El objetivo `make` realiza lo siguiente:

1. Descarga Tectonic 0.17.0 a `~/.local/share/recetario-tools`, si no existe.
2. Convierte todos los `.svg` de `diagramas/` a `.pdf` en `build/` con `rsvg-convert`, conservando los subdirectorios.
3. Compila `dercas.tex` y genera `build/dercas.pdf`.

Si se añade un diagrama nuevo, basta con colocar su `.svg` dentro de `diagramas/` para que el `Makefile` lo convierta.

Para eliminar únicamente los archivos generados:

```bash
make clean
```

## Dependencias

- `make`
- `curl`
- `tar`
- `rsvg-convert`
- Conexión a internet la primera vez, para descargar Tectonic y los paquetes TeX necesarios.

En Arch Linux, una alternativa con paquetes del sistema es:

```bash
sudo pacman -S texlive-latexrecommended texlive-latexextra texlive-pictures texlive-langspanish librsvg make
```

Después se puede compilar directamente con `latexmk -pdf dercas.tex`, aunque el flujo oficial del repositorio sigue siendo `make`.
