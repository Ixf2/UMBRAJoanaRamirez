# UMBRA

[Español](#espanol) · [English](#english)

<a id="espanol"></a>

## Español

Aplicación para crear personajes de fantasía, escribir sus historias y organizar sus fichas. Desarrollada con **React, Vite y React Router**, con temas personalizables y accesibilidad independiente para cada perfil.

### Estado actual

El frontend funciona con almacenamiento en el navegador. Permite trabajar como Invitado o con una cuenta local, cada uno con su biblioteca y sus ajustes.

La interfaz está diseñada principalmente para móvil y tiene un ancho máximo general de **390 px**. Incluye ajustes para pantallas estrechas y texto ampliado; la distribución específica para tablet y PC queda como una futura mejora.

La conexión con el backend de **Spring Boot, ORM y API REST** está pendiente. Actualmente no hay peticiones a un servidor de datos, sincronización entre dispositivos ni roles de administrador.

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

#### Primera entrada

Puedes crear y guardar personajes como Invitado. Para tener otra biblioteca, entra en **Iniciar sesión → Crear cuenta**, completa el registro y guarda el código de recuperación. Después inicia sesión con el correo y la contraseña registrados.

No hay credenciales precreadas. Llamar a una cuenta «Administrador» no le concede permisos adicionales.

Usa el mismo navegador y la misma dirección con la que te registraste: `localhost:5173` y `127.0.0.1:5173` tienen almacenamientos diferentes.

### Funciones

- **Inicio:** portada, acceso al editor y los dos personajes más recientes.
- **Biblioteca:** búsqueda por nombre, clase, raza u origen; filtro de clase y favoritos; ordenación por actualización, nombre o nivel.
- **Fichas:** crear, consultar, editar, duplicar y eliminar personajes. Cada ficha se abre en su propia pantalla (`/biblioteca/:id`), con scroll de página, enlace para volver y confirmación de eliminación dentro de la ficha. Los filtros de biblioteca se conservan en la dirección al volver.
- **Personalización:** nombre, clase, raza, nivel, origen, historia, hasta seis rasgos y cuatro atributos: Fuerza, Destreza, Inteligencia y Carisma.
- **Retratos:** imágenes incluidas, iniciales o un archivo propio PNG, JPG o WebP de hasta 750 KB, con vista previa.
- **Inspiración:** ideas narrativas y personajes aleatorios que se pueden llevar al editor antes de guardarlos.
- **Cuentas locales:** registro, acceso, cierre de sesión, Recordarme y recuperación mediante el código entregado al registrarse.
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

### Datos y cuentas

Las bibliotecas se guardan en `localStorage`. Cada perfil empieza con seis personajes de ejemplo; una biblioteca guardada vacía permanece vacía. Los datos de Invitado se conservan al iniciar o cerrar sesión.

| Clave | Contenido |
| --- | --- |
| `umbra.characters.v1.<owner>` | Biblioteca del perfil; `owner` es el identificador de la cuenta o `guest`. |
| `umbra.accessibility.v2.<owner>` | Ajustes de accesibilidad y apariencia de ese perfil. |
| `umbra.accounts.v1` | Cuentas locales y verificadores de credenciales. |
| `umbra.session.v1` | Identificador de la cuenta activa, en `localStorage` con Recordarme o en `sessionStorage` sin marcarlo. |

Las antiguas preferencias globales de `umbra.accessibility.v1` se recuperan únicamente para Invitado. El cierre de sesión elimina ambas referencias de sesión.

Las contraseñas se verifican con PBKDF2-SHA-256, sal aleatoria por cuenta y 100 000 iteraciones. El código de recuperación se verifica mediante SHA-256. Las contraseñas y los códigos no se persisten en texto plano. Web Crypto requiere un contexto seguro, como localhost o HTTPS.

Las cuentas organizan bibliotecas locales; no proporcionan autenticación ni permisos de servidor. No hay envío de correos. Borrar los datos del sitio elimina las cuentas, las bibliotecas y sus ajustes de ese navegador.

Si no se puede guardar un cambio en la biblioteca, se muestra un error y se conserva el estado anterior. Los ajustes de accesibilidad sí se aplican temporalmente cuando el almacenamiento está bloqueado, con un aviso de que no han podido persistirse.

Sin conexión puedes continuar con la app ya abierta. Recargarla requiere acceso al sitio o tener disponible el servidor local; no hay un service worker para cargarla sin conexión.

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

[browser-smoke.mjs](scripts/browser-smoke.mjs) comprueba los recorridos principales: personajes, filtros, retratos, favoritos, cuentas, recuperación, copias JSON, accesibilidad, separación de perfiles, teclado, fallos de almacenamiento y pantallas de 320 y 390 px.

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
  utils/              Validación, cuentas, almacenamiento y copias JSON
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

### Futura conexión con Spring Boot

La integración con la API REST se concentrará en una capa de servicios HTTP, conectada con los puntos de persistencia actuales:

- [useCharacters.js](src/hooks/useCharacters.js) coordina las operaciones de biblioteca que pasarían a consultar o modificar personajes mediante la API.
- [localAccounts.js](src/utils/localAccounts.js) contiene el acceso, registro y recuperación locales que se sustituirían por la autenticación del backend.
- [preferenceStore.js](src/utils/preferenceStore.js) guarda los ajustes; se podrá decidir si permanecen locales o se sincronizan con el perfil del servidor.

Antes de conectarla habrá que acordar rutas, DTO, identificadores, tratamiento de imágenes, autenticación y permisos. El ORM y el acceso a la base de datos pertenecen al backend. Esta capa HTTP todavía no está implementada en el frontend.

### Compilar y publicar

```bash
npm run build
npm run preview
```

Publica el contenido generado en `dist/`. Como se utiliza `BrowserRouter`, configura el alojamiento para devolver `index.html` en las rutas internas de la aplicación. Utiliza HTTPS fuera del entorno local para disponer de Web Crypto.

---

<a id="english"></a>

## English

An application for creating fantasy characters, writing their stories, and organizing their character sheets. Built with **React, Vite, and React Router**, with customizable themes and independent accessibility settings for each profile.

### Current status

The frontend uses browser storage. You can work as a Guest or with a local account, each with its own library and settings.

The interface is designed primarily for mobile and has a general maximum width of **390 px**. It includes adjustments for narrow screens and enlarged text; dedicated tablet and desktop layouts are planned as a future improvement.

Integration with the **Spring Boot backend, ORM, and REST API** is pending. There are currently no requests to a data server, no synchronization between devices, and no administrator roles.

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

#### First visit

You can create and save characters as a Guest. For a separate library, open **Iniciar sesión → Crear cuenta** (Sign in → Create account), complete registration, and save the recovery code. Then sign in using the email address and password you registered.

There are no preconfigured credentials. Naming an account “Administrator” does not grant additional permissions.

Use the same browser and address you registered with: `localhost:5173` and `127.0.0.1:5173` have separate storage.

### Features

- **Home:** landing screen, access to the editor, and the two most recently updated characters.
- **Library:** search by name, class, race, or origin; filter by class and favorites; sort by update time, name, or level.
- **Character sheets:** create, view, edit, duplicate, and delete characters. Each sheet opens on its own screen (`/biblioteca/:id`), with normal page scrolling, a back link, and inline deletion confirmation. Library filters are kept in the URL when returning.
- **Customization:** name, class, race, level, origin, story, up to six traits, and four attributes: Strength, Dexterity, Intelligence, and Charisma.
- **Portraits:** included images, initials, or your own PNG, JPG, or WebP file of up to 750 KB, with a preview.
- **Inspiration:** story prompts and random characters that can be taken to the editor before saving.
- **Local accounts:** registration, sign-in, sign-out, Remember me, and recovery using the code provided during registration.
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

### Data and accounts

Libraries are saved in `localStorage`. Each profile starts with six example characters; a saved empty library stays empty. Guest data is preserved when signing in or out.

| Key | Content |
| --- | --- |
| `umbra.characters.v1.<owner>` | The profile's library; `owner` is the account identifier or `guest`. |
| `umbra.accessibility.v2.<owner>` | Accessibility and appearance settings for that profile. |
| `umbra.accounts.v1` | Local accounts and credential verifiers. |
| `umbra.session.v1` | The active account identifier, stored in `localStorage` with Remember me or in `sessionStorage` without it. |

Legacy global preferences from `umbra.accessibility.v1` are restored only for the Guest profile. Signing out removes both session references.

Passwords are verified using PBKDF2-SHA-256, a random salt per account, and 100,000 iterations. The recovery code is verified using SHA-256. Passwords and codes are not persisted in plain text. Web Crypto requires a secure context, such as localhost or HTTPS.

Accounts organize local libraries; they do not provide server authentication or permissions. No emails are sent. Clearing site data removes the accounts, libraries, and settings from that browser.

If a library change cannot be saved, an error is displayed and the previous state is preserved. Accessibility settings are still applied temporarily when storage is blocked, with a notice explaining that they could not be persisted.

You can continue using the app while offline if it is already open. Reloading requires access to the site or an available local server; there is no service worker for offline loading.

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

[browser-smoke.mjs](scripts/browser-smoke.mjs) checks the main workflows: characters, filters, portraits, favorites, accounts, recovery, JSON backups, accessibility, profile isolation, keyboard navigation, storage failures, and screens 320 and 390 px wide.

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
  utils/              Validation, accounts, storage, and JSON backups
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

### Future Spring Boot integration

REST API integration will be organized through an HTTP service layer connected to the current persistence points:

- [useCharacters.js](src/hooks/useCharacters.js) coordinates library operations that would use the API to retrieve or modify characters.
- [localAccounts.js](src/utils/localAccounts.js) contains local sign-in, registration, and recovery, which would be replaced by backend authentication.
- [preferenceStore.js](src/utils/preferenceStore.js) saves settings; they may remain local or be synchronized with the profile on the server.

Before integration, routes, DTOs, identifiers, image handling, authentication, and permissions need to be agreed on. The ORM and database access belong to the backend. This HTTP layer is not yet implemented in the frontend.

### Build and deployment

```bash
npm run build
npm run preview
```

Deploy the generated contents of `dist/`. Because the app uses `BrowserRouter`, configure hosting to return `index.html` for internal application routes. Use HTTPS outside the local environment so Web Crypto is available.
