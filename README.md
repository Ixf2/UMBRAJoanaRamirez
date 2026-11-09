# UMBRA

[Español](#espanol) · [English](#english)

<a id="espanol"></a>

## Español

Aplicación para crear personajes de fantasía, escribir sus historias y organizar sus fichas. Desarrollada con **React, Vite y React Router**, con temas personalizables y accesibilidad independiente para cada perfil.

### Estado actual

Documentación revisada el **09/11/2026** a partir del código del repositorio.

La app combina **servicios HTTP de Spring Boot** con **almacenamiento local del navegador**. El registro, el inicio y cierre de sesión y la comprobación de la sesión ya llaman al backend. Biblioteca muestra además personajes públicos del servidor, con una pantalla de detalle propia.

La creación, edición, duplicado, eliminación, favoritos y copias de la biblioteca personal siguen siendo locales, al igual que los ajustes de accesibilidad por perfil. Iniciar sesión no sube esas fichas al servidor ni sincroniza bibliotecas entre dispositivos.

La interfaz está diseñada principalmente para móvil y tiene un ancho máximo general de **390 px**. Incluye ajustes para pantallas estrechas y texto ampliado; la distribución específica para tablet y PC queda como una futura mejora.

### Empezar

Necesitas Node.js y npm instalados. Desde la carpeta del proyecto:

```bash
npm install
npm run dev
```

Abre la dirección que indique Vite. En PowerShell, si la ejecución de `npm.ps1` está bloqueada, utiliza `npm.cmd`:

```powershell
npm.cmd install
npm.cmd run dev
```

Con `package-lock.json` disponible también puedes utilizar `npm ci` para instalar las dependencias según el lock.

#### Configuración de la API en desarrollo

Arranca por separado el backend Spring Boot en **`http://localhost:8080`**, con su configuración de base de datos. Este repositorio contiene el frontend; no incluye el servidor ni la configuración de MariaDB.

[vite.config.js](vite.config.js) reenvía las solicitudes que comienzan por `/api` a `http://localhost:8080`, con `changeOrigin: true` y sin reescribir la ruta. Por ejemplo, `/api/auth/me` llega al backend como `http://localhost:8080/api/auth/me`. Conserva también la exclusión de `public/fonts/**` del observador de archivos.

[.env.development](.env.development) declara:

```dotenv
VITE_API_URL=http://localhost:8080/api
```

Actualmente [api.js](src/services/api.js) utiliza rutas relativas `/api/...` y **no lee `VITE_API_URL`**. Cambiar únicamente esa variable no cambia el destino: la dirección efectiva de desarrollo es el `target` del proxy de Vite. Reinicia Vite después de modificar su configuración.

#### Primera entrada

Puedes crear y guardar personajes como Invitado. Para registrarte en el servidor, entra en **Iniciar sesión → Crear cuenta**, introduce nombre de 2 a 50 caracteres, correo de hasta 100 y contraseña de 8 a 72 caracteres con un carácter especial, y confirma la contraseña. Tras el registro se muestra un enlace para iniciar sesión; no se genera un código de recuperación local.

El inicio de sesión envía correo y contraseña a la API. Al abrir la app se consulta `/api/auth/me`; si devuelve 401 se continúa como Invitado. Si falla la comprobación se muestra un aviso y también se permite continuar como Invitado.

Usa el mismo navegador y la misma dirección para conservar bibliotecas y preferencias locales: `localhost:5173` y `127.0.0.1:5173` tienen almacenamientos diferentes. El frontend no configura credenciales precreadas.

### Funciones

- **Inicio:** portada, acceso al editor y los dos personajes más recientes.
- **Biblioteca:** búsqueda por nombre, clase, raza u origen; filtro de clase y favoritos; ordenación por actualización, nombre o nivel.
- **Fichas:** crear, consultar, editar, duplicar y eliminar personajes. Cada ficha se abre en su propia pantalla (`/biblioteca/:id`), con scroll de página, enlace para volver y confirmación de eliminación dentro de la ficha. Los filtros de biblioteca se conservan en la dirección al volver.
- **Personalización:** nombre, clase, raza, nivel, origen, historia, hasta seis rasgos y cuatro atributos: Fuerza, Destreza, Inteligencia y Carisma.
- **Retratos:** imágenes incluidas, iniciales o un archivo propio PNG, JPG o WebP de hasta 750 KB, con vista previa.
- **Inspiración:** ficha visual con todos los campos aleatorios y editables directamente: nombre, clase, raza, nivel, origen, retrato, personalidad, historia y atributos. Puedes subir un retrato, añadir rasgos propios, regenerar un campo y recuperar la idea anterior. Los cambios manuales se fijan automáticamente para conservarlos al generar otra combinación. **Guardar personaje** valida y guarda directamente en la biblioteca del perfil activo. El editor utiliza el mismo generador completo.
- **Personajes públicos:** listado independiente al final de Biblioteca, con estados de carga, error y lista vacía. Cada tarjeta abre `/personajes-publicos/:id` para consultar historia, personalidad, visibilidad y atributos del servidor. Los filtros locales no filtran este listado.
- **Cuentas del servidor:** registro, acceso, comprobación inicial y cierre de sesión mediante la API; consulta las limitaciones de Recordarme y recuperación más abajo.
- **Perfil:** identidad, recuento de personajes y favoritos, copias de seguridad y acceso a los ajustes.
- **Ayuda y feedback:** preguntas frecuentes, privacidad, avisos de conexión, mensajes de validación y pantalla 404.

### Accesibilidad por perfil

Se abre desde **Menú → Accesibilidad** o desde el enlace del Perfil. Está organizada en cinco submenús:

| Menú | Opciones |
| --- | --- |
| Tamaño de texto | Pequeño, normal, grande y extra grande; selección mediante radios o deslizador. |
| Modo de contraste | Normal, alto contraste e invertido. |
| Lectores de pantalla | Anuncios de cambio de pantalla, lectura voluntaria en voz alta y velocidad pausada, normal o rápida. |
| Navegación por teclado | Foco reforzado y guía de Tab, Mayús + Tab, Enter, Espacio, flechas, Inicio, Fin y Escape. |
| Personalización visual | Temas oscuro, claro y sepia; tres tamaños de controles; seis colores de acento; movimiento reducido. |

Cada cuenta e Invitado conservan sus propios ajustes. Al cambiar de perfil se recupera su configuración; **Restablecer ajustes** afecta únicamente al perfil activo.

El contraste tiene prioridad sobre los colores del tema y del acento, pero conserva esas elecciones para cuando vuelvas al contraste normal. La interfaz respeta también la preferencia del sistema de reducir el movimiento.

La navegación utiliza controles semánticos, etiquetas, textos alternativos y diálogos con gestión del foco. La lectura en voz alta usa las voces disponibles en el navegador o dispositivo y se detiene al cerrar la ficha o salir de su pantalla. Es una función adicional al lector de pantalla del sistema.

### Datos, sesión y cuentas

Las bibliotecas personales se guardan en `localStorage`. Cada perfil empieza con seis personajes de ejemplo; una biblioteca guardada vacía permanece vacía. Los datos de Invitado se conservan al iniciar o cerrar sesión. La clave del perfil autenticado usa el `idUsuario` devuelto por el servidor, convertido a cadena.

| Dato | Ubicación y comportamiento |
| --- | --- |
| `umbra.characters.v1.<owner>` | Biblioteca local; `owner` es el identificador del usuario del servidor o `guest`. |
| `umbra.accessibility.v2.<owner>` | Ajustes locales de accesibilidad y apariencia de ese perfil. |
| Sesión actual | React conserva `id`, `name`, `email` y `rol` a partir de la respuesta del backend. Al recargar se vuelve a consultar `/api/auth/me`. |
| `umbra.accounts.v1` / `umbra.session.v1` | Claves del módulo local anterior. El registro y acceso actuales no las utilizan; la recuperación todavía depende de las cuentas locales antiguas. |

Las antiguas preferencias globales de `umbra.accessibility.v1` se recuperan únicamente para Invitado. Borrar los datos del sitio elimina las bibliotecas y ajustes de ese navegador; no elimina la cuenta del backend.

El login, la comprobación de sesión y el logout utilizan `credentials: 'same-origin'`. El cliente espera que el backend gestione la sesión mediante cookies y no almacena un token de autenticación. La duración y los atributos de las cookies dependen del servidor; no se pueden determinar desde este repositorio.

#### Integración todavía parcial

- **Recordarme:** la casilla permanece en el formulario, pero el servicio solo envía `email` y `password`. Marcarla no configura una duración de sesión diferente en la implementación actual.
- **Recuperación:** `/recuperar` sigue llamando a `recoverAccount` de [localAccounts.js](src/utils/localAccounts.js). Solo modifica cuentas locales antiguas; no restablece la contraseña de las cuentas creadas por la API y no hay envío de correos implementado en el frontend.
- **Roles:** la respuesta de sesión aporta `rol`, pero no existen pantallas ni controles de permisos por rol en este frontend. Los permisos efectivos corresponden al backend.
- **Textos de la interfaz:** algunas etiquetas, ayuda y privacidad aún hablan de «cuenta local». El flujo de registro e inicio de sesión vigente es el de la API descrito aquí.

El módulo local anterior conserva PBKDF2-SHA-256 con sal y 100 000 iteraciones para contraseñas y SHA-256 para códigos. Esto describe las cuentas locales antiguas, no el almacenamiento de contraseñas del backend. Esa recuperación requiere Web Crypto en localhost o HTTPS.

Si no se puede guardar un cambio en la biblioteca, se muestra un error y se conserva el estado anterior. Los ajustes de accesibilidad sí se aplican temporalmente cuando el almacenamiento está bloqueado, con un aviso de que no han podido persistirse.

Con la app ya abierta puedes seguir trabajando con la biblioteca local sin conexión. El registro, el acceso y las fichas públicas necesitan el servidor; recargar requiere acceso al sitio o al servidor local. No hay un service worker para cargar la app sin conexión.

### Copias de seguridad de personajes

En **Perfil → Copia de seguridad**:

1. **Exportar biblioteca (JSON)** descarga los personajes, favoritos y retratos del perfil activo.
2. **Importar copia de seguridad** permite seleccionar un JSON de UMBRA de hasta 10 MB.
3. La app valida el contenido y pide confirmación antes de sustituir toda la biblioteca actual. Admite hasta 500 personajes y rechaza identificadores repetidos.

Las copias de personajes no incluyen cuentas, contraseñas ni ajustes de accesibilidad. Puedes utilizarlas para trasladar una biblioteca a otro navegador o perfil. La implementación está en [characterStore.js](src/utils/characterStore.js) y los controles están en [Profile.jsx](src/pages/Profile.jsx).

### Comandos y comprobaciones

| Comando | Función |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo Vite. |
| `npm test` | Ejecuta las pruebas unitarias de validación, bibliotecas, cuentas y preferencias. |
| `npm run lint` | Comprueba las reglas de JavaScript, JSX y hooks de React. |
| `npm run build` | Genera la aplicación compilada en `dist/`. |
| `npm run preview` | Sirve la compilación para revisarla localmente. |
| `npm run test:browser` | Ejecuta recorridos automáticos en Chrome o Edge. |

#### Pruebas en navegador

[browser-smoke.mjs](scripts/browser-smoke.mjs) contiene recorridos de la versión local anterior: personajes, filtros, retratos, favoritos, cuentas, recuperación, copias JSON, accesibilidad, separación de perfiles, teclado, fallos de almacenamiento y pantallas de 320 y 390 px.

**Pendiente de adaptar a la API:** el recorrido todavía espera el antiguo registro local, su código de recuperación y sus etiquetas. No valida de extremo a extremo el nuevo flujo de sesión ni los personajes públicos; no debe darse por compatible con la integración actual. Las pruebas unitarias de cuentas locales tampoco prueban la autenticación de Spring Boot.

Es una herramienta de desarrollo. Utiliza un contexto temporal aislado y lo elimina al terminar; las cuentas y bibliotecas de prueba pertenecen a ese contexto.

Para ejecutarla:

1. Arranca la app con `npm run dev`.
2. Abre Chrome o Edge con depuración remota en el puerto **9222** y un perfil de navegador dedicado a las pruebas. Por ejemplo, en otra terminal PowerShell con Chrome instalado en su ruta habitual:

   ```powershell
   & "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --remote-debugging-port=9222 "--user-data-dir=$env:TEMP\umbra-browser-smoke"
   ```

3. Ejecuta `npm run test:browser` en otra terminal. En PowerShell puedes usar `npm.cmd run test:browser`.

El script utiliza `http://127.0.0.1:5173` por defecto. Si la app está en otra dirección o quieres una captura, configura estas variables antes de ejecutarlo:

```powershell
$env:UMBRA_URL = "http://127.0.0.1:4173"
$env:UMBRA_SCREENSHOT = Join-Path $env:TEMP "umbra-captura.png"
npm.cmd run test:browser
```

`UMBRA_URL` debe apuntar al servidor que tengas activo; por ejemplo, el de `npm run preview`. Si todo pasa, el script muestra `Browser OK`. Si falla una comprobación, muestra el error, la dirección y el contenido de la pantalla.

Algunas comprobaciones de voz utilizan una simulación: verifican los controles, el texto y la cancelación, pero no la salida de audio real ni un lector de pantalla externo.

### Estructura del proyecto

```text
src/
  App.jsx             Sesión, rutas, espacio del perfil y diálogos
  main.jsx            Montaje de React y BrowserRouter
  App.css             Composición, componentes y variantes de accesibilidad
  index.css           Fuentes y estilos base
  pages/              Pantallas de cada ruta y sus estilos específicos
  components/         Navegación, tarjetas, retratos, formularios y avisos
  hooks/              Estado y persistencia de bibliotecas y preferencias
  services/           Peticiones HTTP de personajes públicos y autenticación
  utils/              Validación, cuentas locales antiguas, almacenamiento y copias JSON
  data/               Personajes iniciales, catálogos y navegación
tests/                Pruebas unitarias
scripts/              Recorridos automáticos de navegador
public/               Imágenes, icono, fuentes y licencias
documentacion/        Manual, código empaquetado y herramientas de generación
```

Las rutas y los títulos se coordinan en [App.jsx](src/App.jsx) y [navigation.js](src/data/navigation.js). Las imágenes se documentan en [ASSETS.md](public/images/ASSETS.md); las licencias de las fuentes están en `public/fonts/` y la licencia del proyecto en [LICENSE](LICENSE).

### Documentación para consultar y extraer

- [Manual completo en PDF](documentacion/UMBRA-manual-completo.pdf): funciones, arquitectura, explicación de componentes y código con números de línea.
- [Manual en HTML](documentacion/UMBRA-manual-completo.html): versión para abrir y buscar en el navegador.
- [Documentación y código en ZIP](documentacion/UMBRA-documentacion-y-codigo.zip): manual y carpeta `codigo/` editable con los recursos del proyecto.
- [Guía de documentación](documentacion/LEEME.md): contenido, extracción y herramientas para regenerar el manual.

El manual y el ZIP son una instantánea del proyecto en el momento de su generación. No se actualizan automáticamente al editar el código o este README. El ZIP de código tampoco incluye los datos guardados por las personas en sus navegadores.

### API de Spring Boot integrada

Las solicitudes están concentradas en [src/services/api.js](src/services/api.js). Estas son las rutas que consume actualmente el frontend:

| Método y ruta | Uso y respuesta esperada |
| --- | --- |
| `GET /api/personajes/publicos` | Lista JSON de personajes públicos; las tarjetas usan `idPersonaje` y `nombre`. |
| `GET /api/personajes/{id}` | Detalle JSON con `nombre`, `visibilidad`, `historia`, `personalidad`, `fuerza`, `destreza`, `inteligencia` y `carisma`. El servicio codifica el identificador en la URL. |
| `POST /api/auth/register` | Envía JSON `{ nombreUsuario, email, password }`; espera JSON en caso de éxito. Traduce 409 a correo registrado y 400 a datos incorrectos. |
| `POST /api/auth/login` | Envía JSON `{ email, password }`; espera `{ idUsuario, nombreUsuario, email, rol }`. Traduce 401 a credenciales incorrectas. |
| `GET /api/auth/me` | Recupera esa misma identidad; 401 se trata como ausencia de sesión. Envía `X-Requested-By: XMLHttpRequest`. |
| `POST /api/auth/logout` | Solicita cerrar la sesión; después del éxito, la app vuelve a Invitado. No necesita cuerpo JSON de respuesta. |

Los personajes públicos se adaptan al componente `CharacterCard` con `interactive={false}`, dentro de un enlace al detalle público. Usan un id visual `public-<idPersonaje>`, muestran «Personaje público» y omiten el nivel. El adaptador actual no asigna retrato, por lo que muestra las iniciales. El detalle público es de consulta; no ofrece edición ni favoritos locales.

`Portrait` elige `imageDataUrl`, después `image` y después un retrato incluido; si no hay imagen o falla la carga, muestra iniciales. Permite ajustar el encuadre con `imagePosition` (por defecto `center`).

Quedan pendientes el CRUD remoto de la biblioteca personal, la sincronización de ajustes, la recuperación de contraseña del servidor y la conexión de Recordarme. El frontend no accede directamente a MariaDB ni al ORM; esas capas pertenecen al backend.

### Compilar y publicar

```bash
npm run build
npm run preview
```

Publica el contenido generado en `dist/`. Como se utiliza `BrowserRouter`, configura el alojamiento para devolver `index.html` en las rutas internas de la aplicación. En producción configura también un proxy inverso para `/api` hacia Spring Boot en el mismo origen: el proxy definido en `server.proxy` es de desarrollo y no acompaña a los archivos compilados. `npm run preview` hereda el proxy de desarrollo de Vite; sigue necesitando el backend activo. Cambiar `VITE_API_URL` no modifica las rutas relativas actuales. Utiliza HTTPS fuera del entorno local y revisa la sesión con la configuración real del servidor.

---

<a id="english"></a>

## English

An application for creating fantasy characters, writing their stories, and organizing their character sheets. Built with **React, Vite, and React Router**, with customizable themes and independent accessibility settings for each profile.

### Current status

Documentation reviewed on **9 November 2026** against the repository source.

The app combines **Spring Boot HTTP services** with **local browser storage**. Registration, sign-in, sign-out, and session checks already call the backend. Library also displays public characters from the server, with a dedicated detail screen.

Personal character creation, editing, duplication, deletion, favorites, and backups remain local, as do accessibility settings per profile. Signing in does not upload these characters or synchronize libraries between devices.

The interface is designed primarily for mobile and has a general maximum width of **390 px**. It includes adjustments for narrow screens and enlarged text; dedicated tablet and desktop layouts remain a future improvement.

### Getting started

You need Node.js and npm installed. From the project folder:

```bash
npm install
npm run dev
```

Open the address displayed by Vite. In PowerShell, if running `npm.ps1` is blocked, use `npm.cmd`:

```powershell
npm.cmd install
npm.cmd run dev
```

With `package-lock.json` available, you can also use `npm ci` to install dependencies according to the lockfile.

#### Development API configuration

Run the Spring Boot backend separately at **`http://localhost:8080`**, with its database configured. This repository contains the frontend; it does not include the backend or MariaDB configuration.

[vite.config.js](vite.config.js) proxies requests starting with `/api` to `http://localhost:8080`, with `changeOrigin: true` and no path rewrite. For example, `/api/auth/me` reaches `http://localhost:8080/api/auth/me`. It also excludes `public/fonts/**` from file watching.

[.env.development](.env.development) declares:

```dotenv
VITE_API_URL=http://localhost:8080/api
```

[api.js](src/services/api.js) currently uses relative `/api/...` paths and **does not read `VITE_API_URL`**. Changing that variable alone does not change the destination; Vite's proxy `target` determines the development destination. Restart Vite after changing its configuration.

#### First visit

You can create and save characters as a Guest. To register on the server, open **Iniciar sesión → Crear cuenta** (Sign in → Create account). Enter a name of 2–50 characters, an email address of up to 100 characters, and a password of 8–72 characters including a special character, then confirm the password. Successful registration displays a sign-in link; it does not issue a local recovery code.

Sign-in sends email and password to the API. On startup, the app checks `/api/auth/me`; a 401 response continues as Guest. If the session check fails, a notice is displayed and Guest access remains available.

Use the same browser and address to retain local libraries and preferences: `localhost:5173` and `127.0.0.1:5173` have separate storage. The frontend does not configure precreated credentials.

### Features

- **Home:** landing screen, access to the editor, and the two most recently updated characters.
- **Library:** search by name, class, race, or origin; filter by class and favorites; sort by update time, name, or level.
- **Character sheets:** create, view, edit, duplicate, and delete characters. Each sheet opens on its own screen (`/biblioteca/:id`), with normal page scrolling, a back link, and inline deletion confirmation. Library filters are kept in the URL when returning.
- **Customization:** name, class, race, level, origin, story, up to six traits, and four attributes: Strength, Dexterity, Intelligence, and Charisma.
- **Portraits:** included images, initials, or your own PNG, JPG, or WebP file of up to 750 KB, with a preview.
- **Inspiration:** a visual draft with every field randomized and directly editable: name, class, race, level, origin, portrait, personality, story, and attributes. Upload a portrait, add custom traits, reroll a field, or restore the previous idea. Manual changes are automatically locked to preserve them when generating another combination. **Guardar personaje** (Save character) validates and saves directly to the active profile's library. The editor uses the same complete generator.
- **Public characters:** an independent list below the personal Library, with loading, error, and empty states. Each card opens `/personajes-publicos/:id` to read server-provided story, personality, visibility, and attributes. Local filters do not filter this list.
- **Server accounts:** registration, sign-in, startup session checks, and sign-out through the API; see the Remember me and recovery limitations below.
- **Profile:** identity, character and favorite counts, backups, and access to settings.
- **Help and feedback:** frequently asked questions, privacy information, connection notices, validation messages, and a 404 screen.

### Accessibility per profile

Open **Menú → Accesibilidad** (Menu → Accessibility) or use the link on the Profile screen. Settings are organized into five submenus:

| Menu | Options |
| --- | --- |
| Text size | Small, normal, large, and extra large; selected using radio buttons or a slider. |
| Contrast mode | Normal, high contrast, and inverted. |
| Screen readers | Screen change announcements, optional read-aloud controls, and slow, normal, or fast reading speed. |
| Keyboard navigation | Enhanced focus indicator and a guide to Tab, Shift + Tab, Enter, Space, arrow keys, Home, End, and Escape. |
| Visual customization | Dark, light, and sepia themes; three control sizes; six accent colors; reduced motion. |

Each account and the Guest profile keep their own settings. Switching profiles restores the corresponding configuration; **Restablecer ajustes** (Reset settings) affects only the active profile.

Contrast takes priority over theme and accent colors while preserving those choices for when you return to normal contrast. The interface also respects the system preference for reduced motion.

Navigation uses semantic controls, labels, alternative text, and dialogs with focus management. Read-aloud uses the voices available in the browser or device and stops when the character sheet is closed or its screen is left. It is an additional feature alongside the system screen reader.

### Data, sessions, and accounts

Personal libraries are saved in `localStorage`. Each profile starts with six example characters; a saved empty library stays empty. Guest data is preserved when signing in or out. An authenticated profile uses the server's `idUsuario`, converted to a string, as its storage owner.

| Data | Location and behavior |
| --- | --- |
| `umbra.characters.v1.<owner>` | Local library; `owner` is the server user identifier or `guest`. |
| `umbra.accessibility.v2.<owner>` | Local accessibility and appearance settings for that profile. |
| Current session | React holds `id`, `name`, `email`, and `rol` from the backend response. Reloading checks `/api/auth/me` again. |
| `umbra.accounts.v1` / `umbra.session.v1` | Legacy local module keys. Current registration and sign-in do not use them; recovery still depends on old local accounts. |

Legacy global preferences from `umbra.accessibility.v1` are restored only for Guest. Clearing site data removes that browser's libraries and preferences; it does not delete the backend account.

Login, session checks, and logout use `credentials: 'same-origin'`. The client expects the backend to manage cookie sessions and does not store an authentication token. Cookie lifetime and attributes depend on the server and cannot be established from this repository.

#### Integration limitations

- **Remember me:** the checkbox remains in the form, but the service only sends `email` and `password`. Selecting it does not configure a different session lifetime in the current implementation.
- **Recovery:** `/recuperar` still calls `recoverAccount` in [localAccounts.js](src/utils/localAccounts.js). It only updates legacy local accounts; it does not reset passwords for API-created accounts. The frontend implements no email delivery.
- **Roles:** the session response supplies `rol`, but this frontend has no role-specific screens or permission checks. Effective authorization belongs to the backend.
- **Interface text:** some labels, help, and privacy text still refer to a “local account”. Current registration and sign-in use the API described here.

The legacy local module retains PBKDF2-SHA-256 with a salt and 100,000 iterations for passwords and SHA-256 for recovery codes. This describes old local accounts, not backend password storage. That recovery requires Web Crypto on localhost or HTTPS.

If saving a library change fails, an error is shown and the previous state is preserved. Accessibility settings still apply temporarily when storage is blocked, with a notice that they could not be persisted.

With the app already open, the local library can still be used offline. Registration, sign-in, and public characters require the server. Reloading requires access to the website or local server; there is no offline service worker.

### Character backups

Under **Perfil → Copia de seguridad** (Profile → Backup):

1. **Exportar biblioteca (JSON)** downloads the active profile's characters, favorites, and portraits.
2. **Importar copia de seguridad** lets you select a UMBRA JSON file of up to 10 MB.
3. The app validates its contents and requests confirmation before replacing the entire current library. It accepts up to 500 characters and rejects duplicate identifiers.

Character backups do not include accounts, passwords, or accessibility settings. You can use them to transfer a library to another browser or profile. The implementation is in [characterStore.js](src/utils/characterStore.js), and the controls are in [Profile.jsx](src/pages/Profile.jsx).

### Commands and checks

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm test` | Runs unit tests for validation, libraries, accounts, and preferences. |
| `npm run lint` | Checks JavaScript, JSX, and React Hooks rules. |
| `npm run build` | Generates the compiled application in `dist/`. |
| `npm run preview` | Serves the build for local review. |
| `npm run test:browser` | Runs automated workflows in Chrome or Edge. |

#### Browser tests

[browser-smoke.mjs](scripts/browser-smoke.mjs) contains workflows for the previous local version: characters, filters, portraits, favorites, accounts, recovery, JSON backups, accessibility, profile isolation, keyboard navigation, storage failures, and screens 320 and 390 px wide.

**API adaptation pending:** the workflow still expects legacy local registration, its recovery code, and its labels. It does not validate the new session flow or public characters end to end and should not be assumed compatible with the current integration. Local account unit tests do not test Spring Boot authentication either.

It is a development tool. It uses an isolated temporary browser context and disposes of it when finished; test accounts and libraries belong to that context.

To run it:

1. Start the app with `npm run dev`.
2. Open Chrome or Edge with remote debugging on port **9222** and a browser profile dedicated to testing. For example, in another PowerShell terminal with Chrome installed at its usual location:

   ```powershell
   & "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --remote-debugging-port=9222 "--user-data-dir=$env:TEMP\umbra-browser-smoke"
   ```

3. Run `npm run test:browser` in another terminal. In PowerShell, you can use `npm.cmd run test:browser`.

The script uses `http://127.0.0.1:5173` by default. If the app is running at another address or you want a screenshot, set these variables before running it:

```powershell
$env:UMBRA_URL = "http://127.0.0.1:4173"
$env:UMBRA_SCREENSHOT = Join-Path $env:TEMP "umbra-captura.png"
npm.cmd run test:browser
```

`UMBRA_URL` must point to your active server, for example the one started by `npm run preview`. If all checks pass, the script displays `Browser OK`. If a check fails, it displays the error, address, and screen content.

Some voice checks use a simulation: they verify the controls, text, and cancellation, but not actual audio output or an external screen reader.

### Project structure

```text
src/
  App.jsx             Session, routes, profile workspace, and dialogs
  main.jsx            React and BrowserRouter setup
  App.css             Layout, components, and accessibility variants
  index.css           Fonts and base styles
  pages/              Route screens and their specific styles
  components/         Navigation, cards, portraits, forms, and notices
  hooks/              State and persistence for libraries and preferences
  services/           HTTP requests for public characters and authentication
  utils/              Validation, legacy local accounts, storage, and JSON backups
  data/               Initial characters, option catalogs, and navigation
tests/                Unit tests
scripts/              Automated browser workflows
public/               Images, favicon, fonts, and licenses
documentacion/        Manual, packaged source code, and generation tools
```

Routes and titles are coordinated in [App.jsx](src/App.jsx) and [navigation.js](src/data/navigation.js). Images are documented in [ASSETS.md](public/images/ASSETS.md); font licenses are in `public/fonts/`, and the project license is in [LICENSE](LICENSE).

### Documentation to read and extract

- [Complete PDF manual](documentacion/UMBRA-manual-completo.pdf): features, architecture, component explanations, and source code with line numbers.
- [HTML manual](documentacion/UMBRA-manual-completo.html): a version to open and search in a browser.
- [Documentation and source ZIP](documentacion/UMBRA-documentacion-y-codigo.zip): the manual and an editable `codigo/` folder containing project resources.
- [Documentation guide](documentacion/LEEME.md): contents, extraction, and tools for regenerating the manual.

The manual and ZIP are snapshots of the project at the time they were generated. They do not update automatically when the code or this README changes. The source ZIP also excludes data saved by people in their browsers.

### Integrated Spring Boot API

Requests are centralized in [src/services/api.js](src/services/api.js). The frontend currently consumes these routes:

| Method and route | Purpose and expected response |
| --- | --- |
| `GET /api/personajes/publicos` | JSON public character list; cards use `idPersonaje` and `nombre`. |
| `GET /api/personajes/{id}` | JSON detail with `nombre`, `visibilidad`, `historia`, `personalidad`, `fuerza`, `destreza`, `inteligencia`, and `carisma`. The service URL-encodes the identifier. |
| `POST /api/auth/register` | Sends JSON `{ nombreUsuario, email, password }`; expects JSON on success. Maps 409 to an existing email and 400 to invalid input. |
| `POST /api/auth/login` | Sends JSON `{ email, password }`; expects `{ idUsuario, nombreUsuario, email, rol }`. Maps 401 to invalid credentials. |
| `GET /api/auth/me` | Restores the same identity; 401 means no active session. Sends `X-Requested-By: XMLHttpRequest`. |
| `POST /api/auth/logout` | Requests session termination; successful logout returns the app to Guest. No JSON response body is required. |

Public characters use `CharacterCard` with `interactive={false}`, wrapped in a link to public detail. Their display id is `public-<idPersonaje>`; cards show “Personaje público” and omit the level. The current adapter assigns no portrait, so initials are displayed. Public detail is read-only and provides no editing or local favorite controls.

`Portrait` chooses `imageDataUrl`, then `image`, then an included portrait. Missing or failed images fall back to initials. `imagePosition` adjusts the crop, defaulting to `center`.

Remote personal-library CRUD, preference synchronization, server password recovery, and Remember me integration remain pending. The frontend does not access MariaDB or the ORM directly; those layers belong to the backend.

### Build and deployment

```bash
npm run build
npm run preview
```

Deploy the generated contents of `dist/`. Because the app uses `BrowserRouter`, configure hosting to return `index.html` for internal application routes. In production, also configure a reverse proxy for `/api` to Spring Boot on the same origin: `server.proxy` is a development setting and is not shipped with the compiled files. `npm run preview` inherits Vite’s development proxy and still requires the backend to be running. Changing `VITE_API_URL` does not change the current relative paths. Use HTTPS outside local development and verify sessions against the actual server configuration.
