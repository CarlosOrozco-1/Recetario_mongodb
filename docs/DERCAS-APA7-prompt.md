# PROMPT: Generador de DERCAS APA7 para proyectos

## Objetivo
Generar un DERCAS (Documento de Especificaciones, Requerimientos y Criterios de Aceptación de Software) siguiendo la estructura y formato APA7, con figuras organizadas y compilable con Tectonic.

## Estructura obligatoria
1. Portada APA7 + tabla de metadatos (Proyecto, Versión, Fecha, Estado, Elaborado por, Fuente de verdad)
2. Historial de revisiones (Fecha | Versión | Descripción)
3. Tabla de contenido
4. 1. Definiciones, acrónimos y abreviaturas
5. 2. Descripción del sistema solicitado
6. 3. Definición de actores
7. 4. Procesos a sistematizar (Nombre, Descripción, Actores, Entradas, Salidas, Especificaciones de funcionamiento, Restricciones adicionales)
8. 5. Diagrama de flujo de los procesos
9. 6. Casos de uso (fichas: Descripción, Actores primarios, Contexto, Condiciones previas, Flujo básico, Requerimientos especiales, Salida, Excepciones)
10. 7. Diagrama de secuencia
11. 8. Diagramas de estado
12. 9. Diagrama ER
13. 10. Requerimientos no funcionales (Arquitectura, Autenticación y autorización, Seguridad de datos, Almacenamiento, Integración)
14. 11. Planificación de ciclos de desarrollo (Ciclo | Qué abarca | Fechas con [Completar: fecha])
15. 12. Criterios de aceptación (CA-XX)
16. 13. Firmas de aceptación ([Completar: ...])
17. Anexo A. Catálogo de la interfaz REST (Método | Ruta | Descripción)
18. Anexo B. Estados y sus transiciones (Entidad | Estados y transiciones permitidas)

## Reglas
- Revisar código, API, modelo de datos y diagramas existentes
- Basarse en docs/referencia/api.md si existe
- No exponer secretos
- Incluir deudas conocidas si existen: "Deuda conocida:"
- Usar [Completar: ...] para datos faltantes
- Diagramas SVG en docs/diagramas/, PDFs en docs/DERCAS/figuras/
- Compilar con Tectonic; Makefile debe regenerar figuras
- Numeración 1., 1.1., 1.1.1
- Usar apa7, babel español, newtx, longtable, booktabs

## Archivos
- docs/DERCAS/main.tex
- docs/DERCAS/Makefile
- docs/DERCAS/.gitignore
