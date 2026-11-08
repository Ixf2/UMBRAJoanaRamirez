"""Build a standalone Spanish manual from the current source, without modifying it."""
from base64 import b64encode
from datetime import datetime
from hashlib import sha256
from html import escape
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'documentacion'
DATE = '08/11/2026'
CONTENT = json.loads((OUT / 'contenido_manual.json').read_text(encoding='utf-8'))

def anchor(path):
    return 'archivo-' + re.sub(r'[^a-zA-Z0-9]+', '-', path).strip('-')

def asset(path, mime):
    return f'data:{mime};base64,' + b64encode(Path(path).read_bytes()).decode('ascii')

def link(path, label=None):
    return f'<a href="#{anchor(path)}">{escape(label or path)}</a>'

def table(headers, rows):
    return '<table><thead><tr>' + ''.join(f'<th>{escape(h)}</th>' for h in headers) + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join(f'<td>{cell}</td>' for cell in row) + '</tr>' for row in rows) + '</tbody></table>'

def function_line(source, name):
    patterns = [rf'\bfunction\s+{re.escape(name)}\s*\(', rf'\b(?:const|let)\s+{re.escape(name)}\b', rf'\b{re.escape(name)}\s*:']
    for index, line in enumerate(source.splitlines(), 1):
        if any(re.search(pattern, line) for pattern in patterns):
            return str(index)
    return '—'

source_order = [
    'index.html', 'src/main.jsx', 'src/App.jsx',
    'src/pages/Home.jsx', 'src/pages/Library.jsx', 'src/pages/CreateCharacter.jsx',
    'src/pages/Login.jsx', 'src/pages/Auth.jsx', 'src/pages/Profile.jsx',
    'src/pages/Accessibility.jsx', 'src/pages/Information.jsx',
    'src/components/header/Header.jsx', 'src/components/bottomnavigation/BottomNavigation.jsx',
    'src/components/hero/Hero.jsx', 'src/components/charactercard/CharacterCard.jsx',
    'src/components/charactercard/Portrait.jsx', 'src/components/modal/Modal.jsx',
    'src/components/forms/AppForm.jsx', 'src/components/feedback/ConnectionStatus.jsx',
    'src/components/feedback/ReadAloud.jsx', 'src/components/icon/Icon.jsx',
    'src/hooks/useCharacters.js', 'src/hooks/usePreferences.js',
    'src/utils/characterStore.js', 'src/utils/localAccounts.js',
    'src/utils/preferenceStore.js', 'src/utils/validateForm.js',
    'src/data/characters.js', 'src/data/characterOptions.js', 'src/data/navigation.js',
    'src/data/accessibility.js', 'src/index.css', 'src/App.css',
    'src/pages/Login.css', 'src/pages/Accessibility.css',
    'package.json', 'vite.config.js', 'eslint.config.js',
    'tests/characterStore.test.js', 'tests/localAccounts.test.js',
    'tests/preferenceStore.test.js', 'tests/validateForm.test.js',
    'scripts/browser-smoke.mjs', 'public/favicon.svg', 'public/images/ASSETS.md',
    '.gitignore', 'README.md', 'LICENSE',
    'public/fonts/Inter-OFL.txt', 'public/fonts/Cormorant-Garamond-OFL.txt',
]
actual_src = {p.relative_to(ROOT).as_posix() for p in (ROOT / 'src').rglob('*') if p.is_file()}
assert actual_src <= set(source_order), f'Undocumented source files: {actual_src - set(source_order)}'
assert all((ROOT / path).is_file() for path in source_order)
sources = {path: (ROOT / path).read_text(encoding='utf-8') for path in source_order}
line_count = sum(len(text.splitlines()) for text in sources.values())
test_names = []
for path, source in sources.items():
    if path.startswith('tests/'):
        test_names.extend((path, name) for name in re.findall(r"test\('([^']+)'", source))

features = [
 ('Inicio', 'Portada, enlace a crear y dos personajes recientes; estado vacío y acceso a la cuenta.', 'src/pages/Home.jsx'),
 ('Biblioteca', 'Busca por nombre, clase, raza u origen; ignora tildes y mayúsculas; filtra clase y favoritos; ordena por fecha, nombre o nivel.', 'src/pages/Library.jsx'),
 ('Consultar ficha', 'Retrato, historia, raza, clase, nivel, origen, rasgos y cuatro atributos en un diálogo.', 'src/App.jsx'),
 ('Crear y editar', 'Valida los campos, personaliza la ficha y guarda en la biblioteca del perfil activo.', 'src/pages/CreateCharacter.jsx'),
 ('Retratos', 'Dos recursos locales, iniciales o archivo PNG/JPEG/WebP de hasta 750 KB, con vista previa.', 'src/components/charactercard/Portrait.jsx'),
 ('Aleatorio', 'Genera un borrador a partir de una ficha base, nombre y atributos; todavía requiere guardar.', 'src/data/characters.js'),
 ('Favoritos', 'Marca y desmarca fichas; el filtro de Biblioteca muestra solo las marcadas.', 'src/hooks/useCharacters.js'),
 ('Duplicado', 'Crea otro id, añade (copia) al nombre y comienza sin marcar favorito.', 'src/App.jsx'),
 ('Eliminación', 'Solicita confirmación y guarda una biblioteca sin la ficha eliminada.', 'src/App.jsx'),
 ('Inspiración', 'Ideas narrativas y semillas aleatorias; pasa el borrador al editor por estado de navegación.', 'src/pages/Information.jsx'),
 ('Registro', 'Crea una cuenta local y entrega su código de recuperación; no inicia automáticamente la sesión.', 'src/pages/Auth.jsx'),
 ('Acceso', 'Comprueba credenciales locales, permite ver la contraseña y elegir Recordarme.', 'src/pages/Login.jsx'),
 ('Recuperación', 'Requiere correo y código guardado para sustituir la contraseña.', 'src/utils/localAccounts.js'),
 ('Perfil', 'Identidad o Invitado, recuento de fichas y favoritos, cierre de sesión y accesos a ajustes.', 'src/pages/Profile.jsx'),
 ('Copias JSON', 'Descarga biblioteca y retratos; valida una copia y la restaura solo tras confirmación.', 'src/utils/characterStore.js'),
 ('Texto', 'Pequeño, normal, grande y extra grande mediante radios y deslizador.', 'src/pages/Accessibility.jsx'),
 ('Contraste', 'Normal, alto o invertido; tiene prioridad sobre los colores de tema y acento.', 'src/pages/Accessibility.jsx'),
 ('Lectura', 'Anuncios de cambio de pantalla, lectura voluntaria de fichas y velocidades 0.75, 1 y 1.25.', 'src/components/feedback/ReadAloud.jsx'),
 ('Teclado', 'Tab, Mayús+Tab, opciones nativas, Escape, foco reforzado y flechas/Inicio/Fin en barra inferior.', 'src/components/bottomnavigation/BottomNavigation.jsx'),
 ('Apariencia', 'Oscuro, claro o sepia; controles normales, grandes o extra grandes; seis acentos; movimiento reducido.', 'src/pages/Accessibility.jsx'),
 ('Perfiles independientes', 'Cada cuenta e Invitado conservan biblioteca y accesibilidad diferentes.', 'src/utils/preferenceStore.js'),
 ('Menús y diálogos', 'Cabecera desplegable, barra inferior activa y diálogos que devuelven el foco.', 'src/components/modal/Modal.jsx'),
 ('Ayuda y privacidad', 'Preguntas desplegables y explicación del tratamiento local de datos.', 'src/pages/Information.jsx'),
 ('Conexión y 404', 'Avisa de eventos de red y presenta una pantalla para rutas inexistentes.', 'src/components/feedback/ConnectionStatus.jsx'),
]

routes = [
 ('/', 'Redirección a /inicio'), ('/inicio', 'Home'), ('/biblioteca', 'Library'),
 ('/crear-personaje', 'CreateCharacter + CharacterEditor'), ('/personaje/:id/editar', 'El mismo editor con una ficha existente'),
 ('/inspiracion', 'Inspiration'), ('/perfil', 'Profile'), ('/login', 'Login; redirige a Perfil si hay sesión'),
 ('/registro', 'Auth; redirige a Perfil si hay sesión'), ('/recuperar', 'Auth con recovery; redirige si hay sesión'),
 ('/accesibilidad', 'Menú de cinco secciones'), ('/accesibilidad/texto', 'Tamaño de texto'),
 ('/accesibilidad/contraste', 'Modo de contraste'), ('/accesibilidad/lectura', 'Lectores de pantalla y voz'),
 ('/accesibilidad/teclado', 'Atajos y foco'), ('/accesibilidad/apariencia', 'Tema, controles, acentos y movimiento'),
 ('/ayuda', 'Help'), ('/privacidad', 'Privacy'), ('Cualquier otra ruta', 'NotFound'),
]

model = [
 ('id', 'string', 'Identificador estable; nuevo UUID cuando se crea una ficha.'),
 ('name', 'string', 'Nombre entre 2 y 60 caracteres tras recortar extremos.'),
 ('type / race', 'string', 'Valores de characterTypes y characterRaces.'),
 ('level', 'number', 'Entero entre 1 y 20.'),
 ('realm / story', 'string', 'Origen hasta 100 caracteres e historia hasta 3000.'),
 ('portrait', 'number', 'Índice del retrato base; sin recurso disponible se muestran iniciales.'),
 ('imageDataUrl / imageName', 'string', 'Imagen local serializada y su nombre; se guardan dentro de la ficha.'),
 ('traits', 'string[]', 'Hasta seis rasgos; la validación admite etiquetas de hasta 40 caracteres.'),
 ('stats', 'number[4]', 'Fuerza, Destreza, Inteligencia y Carisma; enteros de 1 a 20.'),
 ('favorite', 'boolean', 'Estado que utiliza el filtro de favoritos.'),
 ('updatedAt', 'number', 'Fecha en milisegundos; sirve para ordenar fichas recientes.'),
]

storage = [
 ('umbra.characters.v1.&lt;owner&gt;', 'localStorage', 'Biblioteca del propietario. owner es el id de la cuenta o guest.'),
 ('umbra.accessibility.v2.&lt;owner&gt;', 'localStorage', 'Ajustes de accesibilidad y apariencia del propietario.'),
 ('umbra.accounts.v1', 'localStorage', 'Array de cuentas con identificadores, nombres, correos y verificadores.'),
 ('umbra.session.v1', 'sessionStorage o localStorage', 'Id de la cuenta activa. Recordarme decide dónde se conserva.'),
 ('umbra.accessibility.v1', 'localStorage; legado', 'Solo se considera para recuperar los antiguos ajustes de Invitado.'),
]

commands = [
 ('npm.cmd install', 'Instala dependencias según el proyecto. Con un lock compatible, npm.cmd ci ofrece instalación reproducible.'),
 ('npm.cmd run dev', 'Inicia Vite para editar; se abre la URL que muestre la terminal.'),
 ('npm.cmd test', f'Ejecuta las {len(test_names)} pruebas unitarias declaradas mediante node --test.'),
 ('npm.cmd run lint', 'Comprueba reglas de JavaScript, JSX y hooks.'),
 ('npm.cmd run build', 'Compila el frontend en dist/.'),
 ('npm.cmd run preview', 'Sirve la compilación para comprobarla localmente.'),
 ('npm.cmd run test:browser', 'Ejecuta recorridos con app activa y Chrome/Edge con CDP en el puerto 9222.'),
]

font_body = asset(ROOT / 'public/fonts/inter-regular.ttf', 'font/ttf')
font_title = asset(ROOT / 'public/fonts/cormorant-garamond-medium.ttf', 'font/ttf')
font_code = asset(Path(r'C:\Windows\Fonts\consola.ttf'), 'font/ttf')
cover = asset(ROOT / 'public/images/umbra-castle.png', 'image/png')
style = '''
@font-face {font-family:Manual;src:url(__BODY__) format('truetype');font-weight:100 900}
@font-face {font-family:Display;src:url(__TITLE__) format('truetype')}
@font-face {font-family:Source;src:url(__CODE__) format('truetype')}
@page {size:A4;margin:18mm 16mm 19mm}
* {box-sizing:border-box} html {font-family:Manual,Arial,sans-serif;color:#202b2b;font-size:10pt;line-height:1.65}
body {margin:0} h1,h2,h3 {color:#142d2b;line-height:1.2;break-after:avoid} h1,h2 {font-family:Display,Georgia,serif;font-weight:500}
h1 {font-size:32pt;margin:0 0 16pt} h2 {font-size:25pt;margin:0 0 16pt} h3 {font-size:13pt;margin:20pt 0 9pt}
p {margin:0 0 10pt} a {color:#75551d;text-decoration:none} a:hover {text-decoration:underline}
code,.mono {font-family:Source,Consolas,monospace;font-size:.92em;overflow-wrap:anywhere}
.chapter,.file-section {break-before:page} .eyebrow {font-size:9pt;letter-spacing:2px;color:#8b692d;text-transform:uppercase;margin-bottom:12pt}
.cover {min-height:245mm;position:relative;display:flex;flex-direction:column;justify-content:space-between;padding:0 0 12mm}
.cover img {display:block;width:100%;height:81mm;object-fit:cover;margin:13mm 0 9mm;border-radius:2mm}
.cover .brand {font-family:Display,Georgia,serif;font-size:35pt;letter-spacing:6px;color:#7b5925}
.cover h1 {font-size:45pt;line-height:1.05;margin:8mm 0 5mm}.cover .subtitle {font-size:15pt;max-width:145mm;color:#465655}
.cover .meta {border-top:1px solid #a99269;padding-top:5mm;color:#526360;font-size:9pt}
.lead {font-size:12pt;line-height:1.7;color:#425b55}.note {padding:12pt 14pt;border-left:3pt solid #a78c53;background:#f4f0e7;margin:16pt 0;break-inside:avoid}
table {width:100%;border-collapse:collapse;margin:10pt 0 18pt;font-size:8.8pt;table-layout:fixed}
thead {display:table-header-group} th {text-align:left;background:#193a35;color:white;font-weight:500}
th,td {padding:8pt;border-bottom:1px solid #d3ddd8;vertical-align:top;overflow-wrap:anywhere}
tr {break-inside:avoid} th:first-child,td:first-child {width:29%} tbody tr:nth-child(even) {background:#f4f7f4}
.source-index td:first-child {width:48%}.functions th:first-child,.functions td:first-child {width:27%}.functions th:last-child,.functions td:last-child {width:8%;text-align:right}
ul,ol {padding-left:19pt;margin:8pt 0 14pt} li {margin:5pt 0} .toc {list-style:none;padding:0}.toc li {padding:6pt 0;border-bottom:1px solid #dde4de}
.file-label {font-family:Source,Consolas,monospace;font-size:12pt;overflow-wrap:anywhere;margin-bottom:12pt;color:#5c4b2c}
.file-meta {font-size:8pt;color:#687773;margin:10pt 0 16pt}.source {border:1px solid #d7dfda;border-radius:3pt;background:#f7f9f7;padding:7pt 5pt;box-decoration-break:clone}
.source-line {display:grid;grid-template-columns:25pt minmax(0,1fr);break-inside:avoid;line-height:1.5;font-size:8.1pt}
.line-number {font-family:Source,Consolas,monospace;text-align:right;padding-right:8pt;color:#89938d;user-select:none}
.source-text {font-family:Source,Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;tab-size:2;color:#142821}
.flow {border:1px solid #b7c8bf;background:#f1f5f0;padding:12pt 15pt;margin:14pt 0;font-size:10pt;break-inside:avoid}
.flow b {color:#234e43}.small {font-size:8.5pt;color:#5c6d65}.file-section h2 {font-size:24pt}
.diagram {display:grid;gap:7pt;margin:15pt 0}.diagram div {border:1px solid #b8c9bf;padding:10pt 12pt;background:#f4f7f2}.diagram .arrow {border:0;background:none;text-align:center;padding:0;color:#8b692d}
@media screen {body {max-width:820px;margin:auto;padding:40px 44px;background:white}html {background:#e4e8e1}.chapter,.file-section {border-top:1px solid #bdc9bd;margin-top:60px;padding-top:35px}}
'''.replace('__BODY__', font_body).replace('__TITLE__', font_title).replace('__CODE__', font_code)

html = [f'<!doctype html><html lang="es"><head><meta charset="utf-8"><title>UMBRA · Manual completo y código</title><meta name="author" content="Proyecto UMBRA"><style>{style}</style></head><body>']
html.append(f'''<section class="cover" id="portada"><div><p class="brand">UMBRA</p><img src="{cover}" alt="Castillo de fantasía de la portada de UMBRA"><p class="eyebrow">Manual funcional y técnico</p><h1>La aplicación,<br>explicada.</h1><p class="subtitle">Todas sus funciones, el papel de cada componente y el código fuente completo para consultar y estudiar.</p></div><div class="meta">Edición del {DATE} · Frontend local con React y Vite<br>{len(source_order)} archivos de texto reproducidos · {line_count} líneas de código y documentación<br>Incluye accesibilidad independiente por perfil y guía para la futura API REST.</div></section>''')

chapters = [
 ('alcance', '1. Qué incluye este documento'), ('funciones', '2. Todas las funciones de la app'),
 ('rutas', '3. Pantallas y rutas'), ('arquitectura', '4. Cómo se conecta el código'),
 ('datos', '5. Modelo de datos y almacenamiento'), ('recorridos', '6. Recorridos explicados paso a paso'),
 ('accesibilidad', '7. Accesibilidad por perfil'), ('ejecucion', '8. Ejecución y pruebas'),
 ('backend', '9. Futura integración con Spring Boot'), ('indice-archivos', '10. Índice de archivos y código'),
]
html.append('<section class="chapter" id="contenido"><p class="eyebrow">Mapa del documento</p><h2>Contenido</h2><p>Los títulos y enlaces permiten saltar entre explicación y código. El PDF conserva texto seleccionable; el ZIP contiene los archivos originales para editarlos.</p><ol class="toc">' + ''.join(f'<li><a href="#{id}">{title}</a></li>' for id, title in chapters) + '</ol><div class="note">Las explicaciones se basan en los archivos presentes al generar este documento. Cada listado tiene su ruta y números de línea; los cambios posteriores de la app requieren regenerar el manual.</div></section>')

html.append(f'''<section class="chapter" id="alcance"><p class="eyebrow">1 · Punto de partida</p><h2>Qué incluye este documento</h2><p class="lead">UMBRA es una aplicación para crear, organizar y conservar personajes de fantasía. Esta versión ejecuta su lógica y guarda sus datos en el navegador.</p><p>Este manual describe el comportamiento disponible, la arquitectura React, las entradas y responsabilidades de cada componente y las funciones de apoyo. Después de cada explicación aparece el código íntegro del archivo correspondiente, incluido el CSS que hace visibles los ajustes.</p><ul><li>Frontend: React, React DOM, React Router, Vite y JavaScript con módulos.</li><li>Datos: bibliotecas, cuentas locales, sesiones y ajustes de accesibilidad.</li><li>Pruebas: archivos unitarios y recorridos automatizados de navegador.</li><li>Recursos: imágenes, icono y fuentes. Los binarios viajan en el ZIP; sus licencias se conservan.</li></ul><h3>Estado real de la versión</h3><p>No está conectada todavía a un backend Spring Boot ni a una base de datos del servidor. No hay roles, cuenta administradora precreada, envío de correo ni sincronización entre dispositivos. Una cuenta con nombre Administrador tiene los mismos controles que cualquier otra cuenta local.</p><p>Los accesos locales organizan bibliotecas en un navegador; no son una autorización de servidor. Web Crypto requiere un contexto seguro, como localhost o HTTPS.</p><h3>Cómo utilizar el paquete</h3><p>El archivo <code>UMBRA-manual-completo.pdf</code> sirve para leer, buscar e imprimir. El HTML es una versión independiente para el navegador. Dentro del ZIP, la carpeta <code>codigo/</code> conserva los archivos editables y los recursos. Tras extraerla se pueden instalar las dependencias y ejecutar Vite.</p><div class="note">El código de dependencias, node_modules, dist y el historial .git no se imprimen. package-lock.json sí se conserva en el ZIP, pero no se reproduce en el PDF por ser un archivo generado de resolución de paquetes.</div></section>''')

html.append('<section class="chapter" id="funciones"><p class="eyebrow">2 · Inventario funcional</p><h2>Todas las funciones de la app</h2>' + table(['Función', 'Comportamiento y ubicación'], [(escape(name), escape(description) + '<br>' + link(path)) for name, description, path in features]) + '</section>')
html.append('<section class="chapter" id="rutas"><p class="eyebrow">3 · Navegación</p><h2>Pantallas y rutas</h2><p>Las rutas están definidas en App.jsx. La cabecera y la barra inferior toman sus enlaces de navigation.js; el título de cada pantalla también procede de ese catálogo.</p>' + table(['Ruta', 'Contenido'], [(f'<code>{escape(path)}</code>', escape(description)) for path, description in routes]) + '<p>Al cambiar de ruta se actualiza el título, se enfoca el contenido principal y se vuelve al comienzo. Si el alojamiento publica BrowserRouter, debe devolver index.html para que las rutas internas carguen directamente.</p></section>')

html.append('''<section class="chapter" id="arquitectura"><p class="eyebrow">4 · Organización del código</p><h2>Cómo se conecta el código</h2><div class="diagram"><div><b>index.html → main.jsx</b><br>El navegador recibe #root y React monta la aplicación dentro de BrowserRouter.</div><div class="arrow">↓</div><div><b>App → Workspace</b><br>Sesión, propietario actual, rutas, biblioteca, ajustes y diálogos.</div><div class="arrow">↓</div><div><b>Páginas + componentes</b><br>Las páginas organizan una tarea; tarjetas, formularios, cabecera y diálogos se reutilizan.</div><div class="arrow">↓</div><div><b>Hooks</b><br>useCharacters y usePreferences conservan estado React y coordinan su persistencia.</div><div class="arrow">↓</div><div><b>Utilidades → almacenamiento</b><br>Validación, cuentas, JSON y localStorage/sessionStorage.</div></div><h3>Props, estado y eventos</h3><p>Una prop es un dato o una función que el padre entrega al hijo. Por ejemplo, CharacterCard recibe character y onSelect. Su botón llama onSelect(character); Workspace cambia modal y React muestra la ficha.</p><p>useState conserva valores que deben volver a dibujar la interfaz. useRef guarda referencias al DOM o a una locución sin forzar otro render. useEffect conecta y limpia efectos externos, como listeners de conexión, foco y diálogos.</p><h3>La clave que separa perfiles</h3><p>App entrega a Workspace una key igual al id de la cuenta o guest. Al cambiar de perfil, React desmonta el espacio anterior y monta otro. Así los hooks cargan la biblioteca y los ajustes del nuevo propietario, en lugar de reutilizar el estado anterior.</p></section>''')

html.append('<section class="chapter" id="datos"><p class="eyebrow">5 · Datos persistentes</p><h2>Modelo y almacenamiento</h2><p>Una ficha es un objeto JavaScript. La serialización JSON permite guardarla como texto y recuperarla al abrir de nuevo la app.</p>' + table(['Propiedad', 'Tipo y significado'], [(f'<code>{escape(name)}</code>', f'<b>{escape(kind)}</b><br>{escape(desc)}') for name, kind, desc in model]) + '<h3>Claves del navegador</h3>' + table(['Clave', 'Almacén y contenido'], [(f'<code>{key}</code>', f'<b>{escape(kind)}</b><br>{escape(desc)}') for key, kind, desc in storage]) + '<p>Las claves pertenecen al origen del sitio. localhost:5173 y 127.0.0.1:5173 tienen almacenes distintos, igual que dos puertos o navegadores diferentes. El prefijo guest identifica al Invitado y no a una cuenta registrada.</p><p>Las contraseñas se verifican mediante PBKDF2-SHA-256 con sal y 100000 iteraciones; el código de recuperación se verifica con SHA-256. Estos verificadores no convierten localStorage en un servidor protegido. El ZIP de código no incluye datos guardados en los navegadores.</p></section>')

html.append('''<section class="chapter" id="recorridos"><p class="eyebrow">6 · De un clic al resultado</p><h2>Recorridos explicados</h2><h3>Crear o editar una ficha</h3><div class="flow"><b>CharacterEditor → AppForm → submit → saveCharacter → commit → writeCharacters</b></div><ol><li>El editor prepara los campos y el retrato. AppForm recoge FormData y valida las reglas.</li><li>Si hay errores, los muestra y enfoca el primer campo. Si son válidos, llama al callback del editor.</li><li>submit construye la ficha. saveCharacter normaliza, crea id si falta, actualiza la fecha y añade o reemplaza por id.</li><li>commit guarda la lista. Solo después actualiza characters en React.</li><li>El editor vuelve a Biblioteca con un mensaje. Si falla la escritura, permanece en el formulario y muestra el error.</li></ol><h3>Registro y acceso</h3><div class="flow"><b>Auth → registerAccount → código de recuperación<br>Login → loginAccount → App.user → Workspace del propietario</b></div><p>El registro verifica campos y correo duplicado, genera sal y verificadores y devuelve el código. El acceso compara el verificador calculado; Recordarme escribe el id de sesión en localStorage y la opción temporal utiliza sessionStorage. App recibe la identidad y vuelve a montar Workspace para ese perfil.</p><h3>Recuperar la contraseña</h3><p>Auth con recovery pide correo, código y una contraseña nueva confirmada. recoverAccount verifica el código, cambia sal y contraseña y borra las referencias de sesión de esa cuenta. La identidad id permanece, por lo que su biblioteca sigue perteneciendo a la misma cuenta.</p><h3>Exportar una copia</h3><div class="flow"><b>Profile → downloadCharacters → JSON.stringify → Blob → enlace temporal → descarga</b></div><p>El archivo incluye app: UMBRA, version: 1 y characters. Se conservan favoritos y retratos subidos porque forman parte de cada ficha. El nombre incluye una fecha UTC. La URL temporal se libera después de iniciar la descarga.</p><h3>Restaurar una copia</h3><div class="flow"><b>readBackup → importCharacters → parseCharacters → confirmar → onImport → replaceCharacters</b></div><ol><li>Perfil lee un archivo de hasta 10 MB con file.text().</li><li>La utilidad analiza el JSON y comprueba formato, versión, lista y fichas; rechaza ids repetidos.</li><li>La copia validada queda temporalmente en backup. El diálogo indica cuántas fichas sustituirá.</li><li>Confirmar llama replaceCharacters y guarda la nueva biblioteca del propietario activo. Cancelar conserva la biblioteca anterior.</li></ol><p>Una copia de personajes no contiene cuentas, credenciales o accesibilidad. Una lista vacía importada se guarda vacía y no se rellena con ejemplos al recargar.</p><h3>Errores y conexión</h3><p>Los formularios, diálogos y Perfil capturan fallos y muestran feedback. En personajes se conserva el estado anterior si falla el guardado. En accesibilidad el ajuste se aplica en memoria aunque no se pueda persistir. ConnectionStatus anuncia los eventos de red, pero no permite recargar sin conexión por sí mismo.</p></section>''')

html.append('''<section class="chapter" id="accesibilidad"><p class="eyebrow">7 · Ajustes independientes</p><h2>Accesibilidad por perfil</h2><p>Menú → Accesibilidad abre cinco entradas. Cada una muestra el nombre del perfil al que se aplican los cambios.</p>''' + table(['Menú', 'Opciones'], [
 ('Tamaño de texto', 'small, normal, large y extra-large. El deslizador y los radios cambian el mismo valor.'),
 ('Modo de contraste', 'normal, high e inverted. Los modos de contraste sustituyen los colores de la interfaz y mantienen la selección de tema.'),
 ('Lectores de pantalla', 'announceNavigation añade el nombre de la pantalla a una región de estado. readAloud muestra lectura voluntaria de fichas. readingRate elige 0.75, 1 o 1.25.'),
 ('Navegación por teclado', 'enhancedFocus refuerza el contorno. La guía explica Tab, Mayús+Tab, Enter/Espacio, flechas, Inicio/Fin y Escape.'),
 ('Personalización visual', 'theme: dark/light/sepia; elementSize: normal/large/extra-large; accent: red/purple/blue/green/orange/slate; reduceMotion.'),
]) + '''<div class="flow"><b>Control → Accessibility.update → usePreferences.updatePreferences → preferenceStore → data-* de Workspace → variables CSS</b></div><p>La normalización admite solo valores del catálogo. Cada propietario utiliza su clave v2. Invitado puede recuperar la antigua configuración global; una cuenta nueva recibe defaults. Restablecer modifica únicamente el perfil activo.</p><p>Las etiquetas semánticas, textos alternativos y el diálogo nativo se ofrecen siempre. La voz adicional depende de las capacidades y las voces del dispositivo; no activa ni sustituye TalkBack, VoiceOver o NVDA.</p><p>Las reglas CSS de contraste aparecen después de los temas y acentos para que prevalezcan. Al elegir contraste normal vuelven a verse los colores guardados. La app también respeta la preferencia de movimiento reducido del sistema.</p></section>''')

html.append('<section class="chapter" id="ejecucion"><p class="eyebrow">8 · Trabajar con el proyecto</p><h2>Ejecución y pruebas</h2><p>Extrae codigo/ en una carpeta y abre una terminal allí. En PowerShell puede utilizarse npm.cmd para evitar el bloqueo de npm.ps1 por la política de ejecución.</p>' + table(['Comando', 'Para qué sirve'], [(f'<code>{escape(cmd)}</code>', escape(desc)) for cmd, desc in commands]) + f'<h3>Pruebas unitarias incluidas: {len(test_names)}</h3>' + table(['Archivo', 'Caso'], [(link(path, Path(path).name), escape(name)) for path, name in test_names]) + '<h3>Recorridos de navegador</h3><p>browser-smoke.mjs utiliza un contexto temporal aislado mediante CDP. Además del CRUD, verifica cuentas, copias, separación de perfiles, tamaños, contrastes, foco, estructura accesible, pantallas estrechas, conexión y 404. UMBRA_URL cambia la URL base y UMBRA_SCREENSHOT guarda una captura.</p><p>Las voces se simulan en algunos casos; esas pruebas comprueban la conexión de los controles, no una salida de audio real ni el uso de un lector de pantalla externo. La existencia de pruebas no garantiza por sí sola que se hayan ejecutado después de cada cambio.</p><h3>Publicación</h3><p>build produce dist/. El alojamiento debe resolver las rutas de BrowserRouter a index.html y utilizar HTTPS cuando se sirva fuera de localhost. La configuración actual de Vite no contiene endpoints ni proxy para una API.</p></section>')

html.append('''<section class="chapter" id="backend"><p class="eyebrow">9 · Próxima conexión</p><h2>Integración futura con Spring Boot</h2><p class="lead">Esta sección es una propuesta de integración. Los servicios HTTP y endpoints descritos aquí todavía no existen en este frontend.</p><div class="flow"><b>Página → hook → servicio HTTP → controlador REST → servicio Spring → repositorio ORM → base de datos</b></div><p>El punto principal de sustitución es la persistencia. useCharacters podría conservar su interfaz para las páginas y llamar a un servicio de personajes mediante fetch. El acceso, registro y recuperación pasarían a depender de respuestas del backend.</p>''' + table(['Pieza actual', 'Cambio al conectar el servidor'], [
 ('useCharacters + characterStore', 'Cambiar lecturas y escrituras por operaciones HTTP, con estados de carga, error y respuesta del servidor.'),
 ('localAccounts + App/Auth/Login', 'Sustituir verificadores y sesiones locales por la autenticación real del backend. Los roles deben asignarse y comprobarse en el servidor.'),
 ('preferenceStore', 'Decidir si los ajustes permanecen en el dispositivo o se sincronizan en una entidad o recurso del usuario.'),
 ('Modelo de personaje', 'Acordar DTO: ids de cadena o numéricos, nombres de campos, listas de rasgos, orden de atributos y representación o subida del retrato.'),
 ('Configuración', 'Añadir URL base, por ejemplo VITE_API_URL, y acordar CORS o un proxy de desarrollo. No colocar secretos del servidor en variables del frontend.'),
]) + '''<p>Un contrato posible para personajes sería GET y POST /api/personajes, más GET, PUT y DELETE /api/personajes/{id}. Las rutas definitivas deben coincidir con los controladores que se creen. La normalización actual de id espera cadenas; habrá que adaptar ids numéricos si los DTO del ORM los utilizan.</p><p>La base de datos y el ORM se quedan en Spring Boot. El navegador envía y recibe datos HTTP; no utiliza directamente repositorios ORM ni credenciales de la base de datos.</p></section>''')

html.append('<section class="chapter" id="indice-archivos"><p class="eyebrow">10 · Consulta del código</p><h2>Índice de archivos</h2><p>A continuación aparecen las explicaciones y los listados completos. Las líneas son las del archivo original; una línea larga puede ocupar varias líneas impresas conservando un único número.</p>' + table(['Ruta', 'Responsabilidad'], [(link(path), escape(CONTENT.get(path, {}).get('summary', 'Licencia de fuente distribuida con los recursos.'))) for path in source_order]) + '</section>')

manifest = []
for index, path in enumerate(source_order, 1):
    source = sources[path]
    meta = CONTENT.get(path, {'summary': 'Licencia de la fuente incluida en public/fonts.', 'details': ['Se conserva íntegra junto con el recurso tipográfico correspondiente.'], 'functions': {}})
    raw = (ROOT / path).read_bytes()
    digest = sha256(raw).hexdigest()
    lines = source.splitlines()
    manifest.append({'path': path, 'bytes': len(raw), 'lines': len(lines), 'sha256': digest})
    html.append(f'<section class="file-section" id="{anchor(path)}"><p class="eyebrow">Archivo {index:02d} de {len(source_order)}</p><h2>{escape(Path(path).name)}</h2><p class="file-label">{escape(path)}</p><p class="lead">{escape(meta["summary"])}</p>')
    if meta.get('props'):
        html.append(f'<p><b>Entradas / props.</b> {escape(meta["props"])}</p>')
    if meta.get('state'):
        html.append(f'<p><b>Estado.</b> {escape(meta["state"])}</p>')
    html.append('<ul>' + ''.join(f'<li>{escape(detail)}</li>' for detail in meta.get('details', [])) + '</ul>')
    if meta.get('functions'):
        html.append('<h3>Funciones y elementos principales</h3><div class="functions">' + table(['Nombre', 'Qué hace', 'Línea'], [(f'<code>{escape(name)}</code>', escape(description), function_line(source, name)) for name, description in meta['functions'].items()]) + '</div>')
    html.append(f'<h3>Código completo</h3><p class="file-meta">{len(lines)} líneas · SHA-256 del original: <span class="mono">{digest}</span></p><div class="source" data-source-path="{escape(path)}" data-source-sha="{digest}">')
    for number, line in enumerate(lines, 1):
        html.append(f'<div class="source-line"><span class="line-number" aria-hidden="true">{number}</span><span class="source-text">{escape(line) if line else "&#8203;"}</span></div>')
    html.append('</div><p class="small">Listado completo del archivo. <a href="#indice-archivos">Volver al índice de archivos</a>.</p></section>')

html.append('<section class="chapter" id="recursos"><p class="eyebrow">Archivos para extraer</p><h2>Recursos y copia editable</h2><p>El ZIP conserva el PDF, esta versión HTML y una carpeta codigo/ lista para abrir en el editor. Los archivos se leen del proyecto, sin alterar sus contenidos.</p><ul><li>Los PNG y TTF se incluyen en su formato original, junto con sus licencias.</li><li>package-lock.json conserva la resolución de dependencias.</li><li>El manifiesto enumera rutas y hashes para comprobar qué versión del código se documentó.</li><li>Se excluyen dependencias instaladas, compilados, historial de Git y datos de los navegadores.</li></ul><p>Para estudiar una función, usa primero el índice de archivos, consulta su explicación y localiza su número de línea. Para modificar o ejecutar el código, utiliza la copia editable del ZIP o el proyecto original.</p></section></body></html>')
OUT.mkdir(exist_ok=True)
(OUT / 'UMBRA-manual-completo.html').write_text('\n'.join(html), encoding='utf-8')
(OUT / 'manifiesto.json').write_text(json.dumps({'date': DATE, 'source_files': len(manifest), 'source_lines': line_count, 'unit_tests': len(test_names), 'files': manifest}, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'html': str(OUT / 'UMBRA-manual-completo.html'), 'files': len(manifest), 'lines': line_count, 'unit_tests': len(test_names)}, ensure_ascii=False))
