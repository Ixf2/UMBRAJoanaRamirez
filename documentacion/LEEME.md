# Documentación completa de UMBRA

Edición del 08/11/2026, generada a partir de los archivos presentes en el proyecto.

- **UMBRA-manual-completo.pdf**: manual de 129 páginas con funciones, rutas, arquitectura, datos, copias de seguridad, accesibilidad por perfil, explicación de los componentes y código íntegro de 50 archivos.
- **UMBRA-manual-completo.html**: versión independiente para abrir y buscar en un navegador. Lleva las fuentes y la imagen de portada incorporadas.
- **UMBRA-documentacion-y-codigo.zip**: paquete para copiar y extraer. Incluye el PDF, el HTML, esta guía y una carpeta `codigo/` con el proyecto editable y sus recursos.
- **manifiesto.json**: rutas, número de líneas, tamaños y SHA-256 de los archivos documentados.
- **verificacion.json**: comprobación de fuentes, páginas y correspondencia de los listados.

## Qué encontrarás en el manual

1. Funciones disponibles y límites de la versión local.
2. Rutas y estructura React.
3. Modelo de personaje y claves de almacenamiento.
4. Creación, edición, duplicado, favoritos y eliminación.
5. Registro, acceso, sesiones y recuperación local.
6. Exportación e importación de bibliotecas JSON.
7. Los cinco menús de accesibilidad, independientes para cada cuenta e Invitado.
8. Comandos de ejecución, pruebas y futura conexión con Spring Boot.
9. Explicación de cada archivo: responsabilidades, entradas, estado y funciones.
10. Código completo con números de línea, estilos, configuración, pruebas y licencias.

El PDF tiene índice con enlaces, marcadores y texto seleccionable. Las líneas largas se ajustan a la página sin omitir su contenido. La comprobación automática ha encontrado todas las líneas visibles del código en el texto del PDF; la marca UTF-8 BOM, presente en dos archivos, se conserva en el original pero no se imprime como carácter visible.

## Extraer y ejecutar el código

1. Copia `UMBRA-documentacion-y-codigo.zip` a la ubicación que prefieras.
2. Usa **Extraer todo** en Windows.
3. Abre la carpeta `codigo/` en tu editor y una terminal dentro de esa carpeta.
4. Ejecuta:

```powershell
npm.cmd install
npm.cmd run dev
```

También se conserva `package-lock.json` para una instalación con `npm.cmd ci` si el entorno y el lock son compatibles.

El ZIP incluye código, PNG, fuentes y licencias. Excluye `node_modules`, `dist`, `.git` y datos de los navegadores. Las cuentas y bibliotecas que hayas creado en la app permanecen en el almacenamiento del navegador y no se copian con el código. Para conservar personajes usa además **Perfil → Exportar biblioteca**.

## Regenerar el documento

Las herramientas están en `documentacion/` dentro del proyecto original y en `codigo/documentacion/` dentro del ZIP:

- `contenido_manual.json`: explicaciones de archivos y funciones.
- `generar_manual.py`: lee el código y construye el HTML y el manifiesto sin modificar las fuentes.
- `exportar_pdf.mjs`: imprime el HTML mediante Chrome/Edge con CDP en el puerto 9223 y crea un PDF etiquetado con marcadores.
- `verificar_manual.py`: comprueba hashes, compara todos los listados y extrae el texto del PDF generado por Chrome. Esta comprobación utiliza `lxml`.
- `empaquetar_manual.py`: crea y verifica el ZIP.

La generación usa las fuentes del proyecto y Consolas de Windows para los listados. Las explicaciones y la fecha de edición deben revisarse al preparar otra versión. Este documento es una fotografía del código actual; no se actualiza automáticamente al editar la app.
