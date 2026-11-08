# UMBRA

Aplicación de personajes de fantasía con React, Vite y React Router. Interfaz oscura, navegación con teclado y almacenamiento local en el navegador.

## Ejecutar

```bash
npm install
npm run dev
```

En PowerShell con scripts deshabilitados, usa `npm.cmd` en lugar de `npm`.

```bash
npm test
npm run lint
npm run build
npm run preview
```

La comprobación de recorridos en navegador está en `npm run test:browser`. Requiere la app local activa y Chrome o Edge iniciado con depuración remota en el puerto 9222; utiliza un contexto temporal aislado y lo elimina al terminar. `UMBRA_URL` permite elegir otra dirección local y `UMBRA_SCREENSHOT` guarda una captura opcional. Comprueba altas, edición, borrado, favoritos, búsqueda, retratos, cuentas, recuperación, copias JSON, teclado, almacenamiento bloqueado y pantallas de 320/390 px.

## Funciones

- Inicio con personajes recientes y acceso a la creación de fichas.
- Biblioteca con búsqueda por nombre, clase, raza u origen, filtro de clase y favoritos, y orden por fecha, nombre o nivel.
- Crear, consultar, editar, duplicar y eliminar personajes. Las fichas incluyen historia, nivel, reino, rasgos, cuatro atributos y retrato propio PNG/JPG/WebP de hasta 750 KB.
- Inspiración con ideas narrativas y personajes aleatorios que se pueden llevar al editor.
- Registro de cuentas locales, inicio y cierre de sesión, opción Recordarme y recuperación mediante el código entregado al registrarse.
- Perfil con recuentos y exportación/importación de bibliotecas JSON. La importación valida el contenido y pide confirmación antes de sustituir datos.
- Accesibilidad por perfil mediante cinco menús: texto (cuatro tamaños y deslizador), contraste (normal, alto e invertido), lectores de pantalla (anuncios y lectura voluntaria en voz alta), teclado (foco reforzado y guía de atajos) y apariencia (oscuro, claro, sepia; tamaño de controles; seis acentos; movimiento reducido).
- Ayuda, información de privacidad, estado de conexión y página 404.

## Almacenamiento

La app funciona sin servidor de datos. Cada cuenta local y el invitado tienen una biblioteca independiente, inicialmente con seis personajes. Los cambios persisten en `localStorage`; una biblioteca vacía permanece vacía. Los datos del invitado se conservan al cambiar de cuenta. Usa exportar/importar para trasladar personajes entre bibliotecas.

Los ajustes de accesibilidad se guardan por identificador de perfil en `umbra.accessibility.v2.<id>`; Invitado tiene su propia configuración. Al cambiar de cuenta se cargan sus ajustes. Las antiguas preferencias globales se recuperan únicamente para Invitado. Restablecer afecta solo al perfil activo. Si el guardado está bloqueado, los ajustes se aplican durante la sesión y se muestra un aviso. El contraste tiene prioridad sobre los colores del tema, conservando la selección de tema y acento. La lectura en voz alta usa Web Speech cuando está disponible y se detiene al cerrar la ficha o salir de su pantalla; no sustituye al lector de pantalla del dispositivo.

Las cuentas solo existen en el navegador donde se crean. Las contraseñas se guardan como verificadores PBKDF2-SHA-256 con sal aleatoria por cuenta y 100 000 iteraciones; el código de recuperación se verifica mediante SHA-256. No se guardan contraseñas ni códigos de recuperación en texto plano. Es una organización local de bibliotecas, sin autenticación de servidor ni protección frente a personas con acceso al navegador. Web Crypto necesita un contexto seguro: localhost o HTTPS.

Recordarme conserva la sesión en `localStorage`; sin marcarlo se utiliza `sessionStorage`. El cierre de sesión elimina ambas referencias. No hay envío de correos ni sincronización entre dispositivos. Borrar los datos del sitio elimina las cuentas y las bibliotecas. Exporta copias periódicas desde Perfil; estas incluyen personajes y retratos, sin cuentas ni credenciales.

Los fallos de almacenamiento se muestran al usuario y las operaciones que no se pueden guardar no se presentan como completadas. Sin conexión puedes continuar con la app abierta; recargarla requiere acceso al sitio o al servidor local. No incluye un service worker.

## Estructura

- `src/pages/`: pantallas y formularios de cada ruta.
- `src/components/`: navegación, fichas, formularios, avisos y diálogos.
- `src/data/`: personajes iniciales, opciones y navegación.
- `src/hooks/`: bibliotecas locales y preferencias de accesibilidad.
- `src/utils/`: validación, cuentas locales y copias de seguridad.
- `tests/`: pruebas de validación, persistencia y cuentas.
- `public/`: imágenes y fuentes locales con sus licencias.

Las imágenes se documentan en [public/images/ASSETS.md](public/images/ASSETS.md). Las licencias de las fuentes están en `public/fonts/`.

## Publicación

`npm run build` genera `dist/`. El alojamiento debe servir `index.html` para las rutas de la aplicación, ya que se utiliza `BrowserRouter`. No incluyas las bibliotecas ni las cuentas locales en el despliegue; son datos propios de cada navegador.
