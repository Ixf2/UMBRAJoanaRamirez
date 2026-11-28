# UMBRA

[Español](#espanol) · [English](#english)

<a id="espanol"></a>

## Español

UMBRA es una aplicación para crear personajes de fantasía, escribir sus historias y organizar sus fichas. La interfaz usa React, React Router y Vite. Spring Boot gestiona la sesión y guarda los personajes en MariaDB. Los ajustes de apariencia y accesibilidad se guardan en el navegador.

### Ejecutar en local

Necesitas **Node.js 24 LTS** como opción compatible con las dependencias del proyecto, npm y un backend Spring Boot en `http://localhost:8080` con MariaDB configurada. Este repositorio contiene el frontend. Arranca el backend por separado.

Desde la carpeta que contiene `package.json`:

```bash
npm ci
npm run dev
```

Abre la URL que muestre Vite. Si PowerShell bloquea `npm.ps1`, utiliza `npm.cmd ci` y `npm.cmd run dev`. El proxy de Vite reenvía `/api` a `http://localhost:8080`, conserva la ruta y utiliza `changeOrigin: true`. Los servicios usan URLs relativas. Si el backend escucha en otra dirección, ajusta el destino en [vite.config.js](vite.config.js) y reinicia Vite. La variable `VITE_API_URL` de [.env.development](.env.development) está declarada y los servicios actuales usan el proxy.

### Crear y consultar personajes

1. Abre **Iniciar sesión → Crear cuenta**. Tras registrarte, inicia sesión con tu correo y contraseña.
2. Abre **Crear personaje**. Puedes escribirlo desde cero o generar un borrador. Completa nombre, clase, raza, nivel, origen, historia, personalidad, hasta seis rasgos y cuatro atributos. El editor permite elegir un retrato incluido, iniciales o un PNG, JPG o WebP de hasta 750 KB.
3. Selecciona la **visibilidad**. Una ficha privada aparece en **Mis personajes privados**. Una pública aparece en el catálogo público cuando la devuelve el servidor. Tu ficha pública abre el detalle editable de tu biblioteca. Las fichas públicas de otras personas se abren en un detalle de solo lectura.
4. Desde tu ficha puedes editar, marcar como favorita, duplicar o eliminar con confirmación. Al duplicar se crea una ficha nueva sin favorito y se conserva la elección de retrato incluido o iniciales. La imagen subida a la ficha original no se copia.

**Inspiración** genera una combinación editable y permite fijar campos, regenerarlos por separado y recuperar la idea anterior. Puedes guardar la idea en el servidor desde la propia pantalla. Si subes un retrato allí, se usa para la vista previa. Para guardarlo en el servidor, adjúntalo desde **Crear personaje** o **Editar**.

**Biblioteca** comparte la búsqueda por nombre, clase, raza u origen y la ordenación por nombre, nivel o identificador descendente entre las secciones privada y pública. La búsqueda ignora tildes y mayúsculas. **Solo favoritos** filtra únicamente la sección privada. Los parámetros `q`, `class`, `favorites` y `sort` se guardan en la URL. El catálogo público muestra el total de resultados y estados de carga, error y lista vacía.

### Sesión y accesibilidad

Al abrir UMBRA se consulta `GET /api/auth/me`. Si devuelve 401, la aplicación continúa como visitante. Si falla la petición, se muestra un aviso. Biblioteca, editor, Inspiración y Perfil redirigen a inicio de sesión cuando no hay una sesión activa. Inicio, ayuda, privacidad, accesibilidad y la ruta directa de detalle público siguen disponibles. La respuesta del servidor determina si se puede consultar una ficha pública.

La sesión depende de las cookies de Spring Boot. La casilla **Recordarme** permanece en el formulario y la petición de login envía correo y contraseña. **Recuperar acceso** todavía usa el sistema de cuentas locales antiguo y solo puede recuperar esas cuentas. El backend determina los permisos efectivos.

En **Menú → Accesibilidad** puedes ajustar el tamaño del texto, contraste, anuncios de navegación, lectura en voz alta, foco de teclado, tema, tamaño de controles, acento y movimiento reducido. Puedes consultar los atajos de teclado desde el mismo menú. Los ajustes se guardan por perfil y origen en `localStorage`, con un perfil independiente para visitantes. La lectura usa las voces del navegador o dispositivo y se detiene al abandonar la ficha. El diseño se adapta a móvil, tablet desde 768 px y escritorio desde 1200 px.

### Copias JSON y migración

- **Perfil → Exportar biblioteca (JSON)** guarda los datos de las fichas cargadas de tu cuenta, incluidos los favoritos. Los retratos almacenados en MariaDB quedan fuera de la copia como archivos de imagen. El JSON contiene los campos que recibe la interfaz, incluida la referencia a la miniatura.
- **Perfil → Importar copia de seguridad** valida un JSON de UMBRA de versión 1 de hasta 10 MB y 500 fichas. Rechaza identificadores duplicados en el archivo y pide confirmación antes de añadir fichas a MariaDB. La biblioteca existente se conserva.
- La importación compara nombre normalizado, clase, raza, nivel e historia para omitir fichas equivalentes. Crea las demás con identificadores nuevos, intenta subir los retratos incrustados compatibles y muestra un resumen con importadas, omitidas, imágenes y errores. Si falla un retrato, la ficha creada se conserva.
- Las copias antiguas se importan manualmente. El validador actual conserva los campos del formato local original. Al importar se aplican los valores predeterminados de personalidad, visibilidad privada y categoría 1. La copia está pensada para trasladar fichas y excluye cuentas, credenciales y preferencias.

### 3. Repositorios

| Componente | Tecnología | Repositorio |
| --- | --- | --- |
| Aplicación web | React, Vite | [UMBRA Web](https://github.com/Ixf2/UMBRAJoanaRamirez) |
| Aplicación móvil | Kotlin, Android Studio | [UMBRA Android](https://github.com/Ixf2/UMBRAAndroid) |
| Backend | Java, Spring Boot, Maven | [UMBRA Backend](https://github.com/Ixf2/UmbraBackendJoanaRam-rez) |
| Base de datos | MariaDB, SQL | [SQL `umbra`](https://drive.google.com/file/d/1jVAfkBek3cXsasbAn0mDg8_ejbLLUk1e/view?usp=sharing) |

### Arquitectura y API

[App.jsx](src/App.jsx) coordina sesión y rutas. [useCharacters.js](src/hooks/useCharacters.js) carga las fichas propias y vuelve a consultar la biblioteca después de cambios. [personajesApi.js](src/services/personajesApi.js) convierte los datos entre el formato React y el del servidor. [api.js](src/services/api.js) gestiona autenticación y lecturas públicas. MariaDB se consulta desde Spring Boot.

| Método y ruta | Uso desde el frontend |
| --- | --- |
| `POST /api/auth/register` | Envía `nombreUsuario`, `email` y `password` como JSON. |
| `POST /api/auth/login`, `GET /api/auth/me` | Obtienen `idUsuario`, `nombreUsuario`, `email` y `rol`. La comprobación de sesión envía `X-Requested-By: XMLHttpRequest`. |
| `POST /api/auth/logout` | Pide al servidor cerrar la sesión. |
| `GET /api/personajes/mios` | Carga la lista de fichas propias. |
| `GET /api/personajes/publicos`, `GET /api/personajes/{id}` | Obtienen el catálogo público y la ficha consultada por ID. |
| `POST /api/personajes`, `PUT /api/personajes/{id}`, `DELETE /api/personajes/{id}` | Crean, actualizan y eliminan. Favoritos usa el mismo `PUT`. |
| `POST /api/personajes/{id}/imagen` | Sube un retrato mediante `multipart/form-data`, campo `archivo`. |
| `GET /api/personajes/{id}/imagen/miniatura` | Sirve la imagen que usa la interfaz para retratos remotos. |

El editor guarda primero la ficha y después sube el archivo cuando hay uno nuevo. Si la subida falla, la ficha puede estar ya guardada y se muestra un aviso. Los retratos prueban la imagen de vista previa o del servidor, después el retrato incluido si existe y, como último recurso, las iniciales.

### Compilación, rendimiento y comprobaciones

| Comando | Resultado |
| --- | --- |
| `npm run build` | Genera `dist/` con la aplicación, el manifiesto PWA y el service worker. |
| `npm run preview` | Sirve la compilación para revisarla localmente. Las funciones con datos necesitan el backend. |
| `npm test` | Ejecuta pruebas unitarias de generación, validación, copias, cuentas locales antiguas y preferencias. |
| `npm run lint` | Comprueba reglas de JavaScript, JSX y hooks. |
| `npm run test:browser` | Ejecuta un recorrido de la versión local anterior. Aún espera su flujo de registro y recuperación, por lo que no valida la integración actual con Spring Boot. |

Para publicar, sirve `dist/` por HTTPS, dirige `/api` a Spring Boot en el mismo origen y devuelve `index.html` para las rutas internas de React. La PWA usa `/inicio` como entrada, iconos de 192 y 512 px y actualización automática. El service worker precachea recursos estáticos de la interfaz y excluye `/api/` del fallback de navegación. La sesión, las fichas y los retratos del backend requieren conexión.

La interfaz utiliza imágenes WebP y fuentes locales WOFF2 con `font-display: swap`. Los originales PNG y TTF se conservan como recursos. El [conversor de fuentes](scripts/convertir-fuentes.mjs) se puede ejecutar desde la raíz con `node scripts/convertir-fuentes.mjs`. Consulta las imágenes y licencias del proyecto. [Recursos gráficos](public/images/ASSETS.md) · [Licencia](LICENSE)

### Documentación

El manual en español incluye arquitectura, recorridos, contrato HTTP y listados del frontend con números de línea. El ZIP incluye una copia editable en `codigo/` con recursos y archivo de dependencias. Esta edición corresponde al **23/11/2026**.

- [Guía de documentación](documentacion/LEEME.md)
- [Manual PDF](documentacion/UMBRA-manual-completo.pdf) · [Manual HTML](documentacion/UMBRA-manual-completo.html)
- [Documentación y código en ZIP](documentacion/UMBRA-documentacion-y-codigo.zip)

<a id="english"></a>

## English

UMBRA is a web app for creating fantasy characters, writing their stories, and organizing their character sheets. The interface uses React, React Router, and Vite. Spring Boot manages sessions and stores characters in MariaDB. Appearance and accessibility preferences are stored in the browser.

### Run locally

Use **Node.js 24 LTS** as a compatible runtime, npm, and a Spring Boot backend running at `http://localhost:8080` with MariaDB configured. This repository contains the frontend. Start the backend separately.

From the directory containing `package.json`:

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. If PowerShell blocks `npm.ps1`, use `npm.cmd ci` and `npm.cmd run dev`. Vite forwards `/api` to `http://localhost:8080`, preserving the path and using `changeOrigin: true`. The services use relative URLs. If the backend listens elsewhere, update the target in [vite.config.js](vite.config.js) and restart Vite. [.env.development](.env.development) declares `VITE_API_URL`, and the current services use the proxy.

### Create and browse characters

1. Open **Iniciar sesión → Crear cuenta** (Sign in → Create account). After registration, sign in with your email and password.
2. Open **Crear personaje** (Create character). Start from scratch or generate a draft. Fill in the name, class, race, level, origin, story, personality, up to six traits, and four attributes. Choose a built-in portrait, initials, or a PNG, JPG, or WebP file up to 750 KB.
3. Choose **visibility**. A private sheet appears under **Mis personajes privados** (My private characters). A public sheet appears in the public catalog when returned by the server. Your own public entry opens your editable library detail. Public entries owned by someone else open a read-only detail page.
4. From your sheet, you can edit, mark it as a favorite, duplicate it, or confirm deletion. Duplication creates a new sheet without the favorite flag and carries over the built-in portrait or initials selection. An uploaded image from the original sheet is excluded.

**Inspiración** (Inspiration) generates an editable combination, lets you lock or reroll individual fields, and can restore the previous idea. You can save the idea to the server directly from this page. A portrait uploaded here is used for preview. To save the file to the server, attach it in **Crear personaje** (Create) or **Editar** (Edit).

**Biblioteca** (Library) shares name, class, race, and origin search across both sections, along with class filtering and sorting by name, level, or descending ID. Search ignores accents and case. **Solo favoritos** (Favorites only) applies to the private section. The URL preserves `q`, `class`, `favorites`, and `sort`. The public catalog displays a result count and loading, error, and empty states.

### Sessions and accessibility

On startup, UMBRA calls `GET /api/auth/me`. A 401 response opens the app in visitor mode. A failed request displays a notice. The library, editor, Inspiration, and Profile redirect to sign-in when there is no active session. Home, help, privacy, accessibility, and the direct public-detail route remain available. The server response determines whether a public sheet can be viewed.

Spring Boot cookies manage the session. The **Recordarme** (Remember me) checkbox is still shown, and the login request sends email and password. **Recuperar acceso** (Recover access) still uses the legacy local account system and only recovers those accounts. The backend determines effective permissions.

Under **Menú → Accesibilidad** (Menu → Accessibility), adjust text size, contrast, navigation announcements, read-aloud, keyboard focus, theme, control size, accent, and reduced motion. The same menu includes a keyboard guide. Preferences are stored per profile and origin in `localStorage`, with a separate visitor profile. Read-aloud uses browser or device voices and stops when you leave the sheet. The layout adapts to mobile, tablets from 768 px, and desktops from 1200 px.

### JSON backups and migration

- **Perfil → Exportar biblioteca (JSON)** (Profile → Export library) downloads the loaded sheets for your account, including favorites. Portraits stored in MariaDB are excluded as image files. The JSON contains the fields used by the interface, including the thumbnail reference.
- **Perfil → Importar copia de seguridad** (Profile → Import backup) validates a UMBRA version 1 JSON file up to 10 MB and 500 sheets. It rejects duplicate IDs in the file and asks for confirmation before adding sheets to MariaDB. Existing sheets are preserved.
- Import compares normalized name, class, race, level, and story to skip equivalent sheets. It creates new IDs for the remaining entries, attempts to upload supported embedded portraits, and reports imported sheets, skipped entries, uploaded images, and errors. A failed portrait upload leaves the created sheet in place.
- Import earlier backups manually. The current validator retains the fields from the original local format. Import applies default personality, private visibility, and category 1. Backups transfer character data and exclude accounts, credentials, and preferences.

### Architecture and API

[App.jsx](src/App.jsx) coordinates sessions and routes. [useCharacters.js](src/hooks/useCharacters.js) loads owned sheets and refreshes the library after changes. [personajesApi.js](src/services/personajesApi.js) maps data between React and the server. [api.js](src/services/api.js) handles authentication and public reads. Spring Boot accesses MariaDB.

| Method and route | Frontend use |
| --- | --- |
| `POST /api/auth/register` | Sends `nombreUsuario`, `email`, and `password` as JSON. |
| `POST /api/auth/login`, `GET /api/auth/me` | Read `idUsuario`, `nombreUsuario`, `email`, and `rol`. The session check sends `X-Requested-By: XMLHttpRequest`. |
| `POST /api/auth/logout` | Asks the server to end the session. |
| `GET /api/personajes/mios` | Loads owned character sheets. |
| `GET /api/personajes/publicos`, `GET /api/personajes/{id}` | Load the public catalog and a character by ID. |
| `POST /api/personajes`, `PUT /api/personajes/{id}`, `DELETE /api/personajes/{id}` | Create, update, and delete sheets. Favorites use the same `PUT`. |
| `POST /api/personajes/{id}/imagen` | Uploads a portrait using the `archivo` field in `multipart/form-data`. |
| `GET /api/personajes/{id}/imagen/miniatura` | Serves the image used for remote portraits in the interface. |

The editor saves the sheet first and then uploads the file if a new one is attached. If the upload fails, the sheet may already be saved and the app shows a notice. Portraits use the preview or server image, then fall back to a built-in portrait when available and finally to initials.

### Build, performance, and checks

| Command | Result |
| --- | --- |
| `npm run build` | Generates `dist/` with the app, PWA manifest, and service worker. |
| `npm run preview` | Serves the build for local review. Features that use server data require the backend. |
| `npm test` | Runs unit tests for generation, validation, backups, legacy local accounts, and preferences. |
| `npm run lint` | Checks JavaScript, JSX, and React Hooks rules. |
| `npm run test:browser` | Runs a workflow for the previous local version. It still expects that version's registration and recovery flow, so it does not validate the current Spring Boot integration. |

To deploy, serve `dist/` over HTTPS, route `/api` to Spring Boot on the same origin, and return `index.html` for internal React routes. The PWA uses `/inicio` as its entry point, 192 and 512 px icons, and automatic updates. The service worker precaches static interface assets and excludes `/api/` from the navigation fallback. Sessions, character sheets, and backend portraits require a connection.

The interface uses WebP images and local WOFF2 fonts with `font-display: swap`. The original PNG and TTF assets are retained. Run the [font converter](scripts/convertir-fuentes.mjs) from the project root with `node scripts/convertir-fuentes.mjs`. [Image assets](public/images/ASSETS.md) · [License](LICENSE)

### Documentation

The Spanish manual includes architecture, workflows, the HTTP contract, and numbered frontend source listings. The ZIP includes editable source in `codigo/`, assets, and the dependency lockfile. This edition is dated **November 23, 2026**.

- [Documentation guide](documentacion/LEEME.md)
- [PDF manual](documentacion/UMBRA-manual-completo.pdf) · [HTML manual](documentacion/UMBRA-manual-completo.html)
- [Documentation and source ZIP](documentacion/UMBRA-documentacion-y-codigo.zip)
