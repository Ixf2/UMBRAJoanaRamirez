# Documentación completa de UMBRA

Edición del **09/11/2026**, revisada a partir del código actual del repositorio.

- **[UMBRA-manual-completo.pdf](UMBRA-manual-completo.pdf)**: manual de 201 páginas con funciones, configuración de la API, arquitectura, accesibilidad y código íntegro de 62 archivos de texto.
- **[UMBRA-manual-completo.html](UMBRA-manual-completo.html)**: versión independiente para abrir y buscar en el navegador, con fuentes e imagen de portada incorporadas.
- **[UMBRA-documentacion-y-codigo.zip](UMBRA-documentacion-y-codigo.zip)**: PDF, HTML, guía, manifiesto, verificación y carpeta `codigo/` con los originales editables y recursos.
- **[manifiesto.json](manifiesto.json)**: fecha, rutas, número de líneas, tamaños y SHA-256 de los archivos documentados.
- **[verificacion.json](verificacion.json)**: comprobación de páginas, fuentes, imágenes y correspondencia de los listados con los originales.
- **[contenido_manual.json](contenido_manual.json)**: explicaciones actualizadas de los archivos, responsabilidades y funciones.

## Cambios documentados

El registro, login, comprobación inicial y logout ya consumen la API de Spring Boot. La biblioteca incorpora un listado remoto de personajes públicos y la ruta `/personajes-publicos/:id`. La biblioteca personal, sus favoritos, copias y ajustes siguen guardándose en el navegador.

El manual y el README describen los seis endpoints utilizados por `src/services/api.js`, el proxy `/api` hacia `http://localhost:8080`, `changeOrigin: true`, las cookies de sesión esperadas y los DTO que consume el cliente. `.env.development` declara `VITE_API_URL`, pero el servicio todavía no la utiliza. La vista previa local de Vite hereda el proxy; para publicar `dist/` se necesita configurar el servidor de alojamiento.

También se documentan las tarjetas públicas, las prioridades y el encuadre de retratos, las fichas locales en su propia pantalla y el generador editable de Inspiración. Los listados incorporan los nuevos servicios, pantallas, utilidades, estilos, datos y pruebas.

La integración sigue siendo parcial: Recordarme no se envía al backend; Recuperar acceso solo actúa sobre las cuentas locales antiguas; no hay CRUD remoto de la biblioteca personal ni controles de interfaz por rol. Algunas etiquetas, ayuda y privacidad conservan textos anteriores. El recorrido automático de navegador aún espera el registro y el código de recuperación locales; no valida la integración HTTP actual.

## Qué encontrarás en el manual

1. Alcance real de la versión y funciones disponibles.
2. Rutas de fichas personales y públicas.
3. Arquitectura React, servicios HTTP y persistencia local por perfil.
4. Modelo de ficha local, DTO remotos y claves del navegador.
5. Recorridos de creación, consulta, registro, sesión y copias JSON.
6. Los cinco menús de accesibilidad.
7. Comandos y alcance de las pruebas existentes.
8. Configuración de desarrollo, endpoints, publicación y tareas pendientes de la integración.
9. Explicación y código completo con números de línea de 62 archivos.

El PDF tiene índice con enlaces, marcadores y texto seleccionable. La verificación compara los hashes y listados HTML con los archivos originales y busca todas las líneas visibles del código en el texto del PDF. Las marcas UTF-8 BOM se conservan en los originales, aunque no se imprimen como caracteres visibles.

La revisión documenta el contrato observado en el frontend; no certifica el funcionamiento del backend, que no está incluido en este repositorio. No se ha modificado el código ni la configuración de la aplicación para preparar esta edición.

## Extraer y ejecutar

1. Extrae `UMBRA-documentacion-y-codigo.zip` y abre `codigo/` en tu editor.
2. Arranca por separado el backend Spring Boot en `http://localhost:8080`, con su base de datos configurada.
3. Abre una terminal en `codigo/` y ejecuta:

```powershell
npm.cmd install
npm.cmd run dev
```

También puedes usar `npm.cmd ci` para instalar según `package-lock.json`. Abre la dirección que muestre Vite.

Sin backend, la biblioteca local de Invitado sigue disponible tras el aviso de sesión, pero el registro, acceso y personajes públicos necesitan el servidor.

El ZIP incluye `.env.development`, código, imágenes, fuentes y licencias. Excluye `node_modules`, `dist`, `.git` y datos de navegadores. No incluye el backend ni sus credenciales o configuración de base de datos. Para conservar tus personajes locales, utiliza además **Perfil → Exportar biblioteca**.

## Herramientas de documentación conservadas

Se mantienen sin modificar los scripts de la edición anterior, en `documentacion/` y en `codigo/documentacion/` dentro del ZIP:

- `generar_manual.py`: generador original de HTML y manifiesto. **Su lista de archivos, fecha y capítulos describen la edición anterior y necesitan adaptarse antes de regenerar esta edición.** Ejecutarlo tal cual con las fuentes actuales detiene la generación al detectar archivos nuevos sin documentar.
- `exportar_pdf.mjs`: imprime el HTML con Chrome/Edge mediante CDP en el puerto 9223. Su pie de página conserva la fecha anterior; debe ajustarse en una futura revisión del generador. El PDF entregado en esta edición lleva la fecha 09/11/2026.
- `verificar_manual.py`: comprueba hashes, listados y texto del PDF; requiere Python y `lxml`.
- `empaquetar_manual.py`: crea y verifica el ZIP a partir del manifiesto vigente.

Para esta edición se adaptó la generación de documentos de forma temporal, conservando los scripts originales por la indicación de no tocar código. Las explicaciones actualizadas están en `contenido_manual.json` y los capítulos completos en el HTML entregado. No ejecutes el generador antiguo como si actualizara automáticamente esos capítulos.

El manual y el ZIP son una instantánea. Cambiar el README o las fuentes después de generarlos exige actualizar los listados y hashes, volver a exportar el PDF, verificarlo y empaquetarlo de nuevo.
