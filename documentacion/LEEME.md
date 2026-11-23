# Documentación de UMBRA

Edición del **23/11/2026**, basada en el frontend del repositorio.

| Archivo | Contenido |
| --- | --- |
| [Manual PDF](UMBRA-manual-completo.pdf) | Guía funcional y técnica con índice, texto seleccionable y listados numerados. |
| [Manual HTML](UMBRA-manual-completo.html) | Edición autónoma para navegar y buscar en el manual. |
| [Documentación y código ZIP](UMBRA-documentacion-y-codigo.zip) | Manual, informes y carpeta `codigo/` con los archivos editables, recursos y dependencias fijadas. |
| [Contenido técnico](contenido_manual.json) | Descripciones de los archivos y sus funciones. |
| [Manifiesto](manifiesto.json) | Rutas, tamaños, líneas y hashes SHA-256 de los archivos reproducidos. |
| [Verificación](verificacion.json) | Resultados de la comprobación de archivos, listados y PDF. |

## Qué cubre esta edición

- Sesión de Spring Boot y acceso a las funciones que requieren cuenta.
- Biblioteca privada en MariaDB, catálogo público, filtros compartidos y rutas de detalle según la propiedad de la ficha.
- Creación, edición, duplicado, favoritos, eliminación y subida de retratos en una petición independiente.
- Importación aditiva de copias JSON antiguas y alcance de la exportación actual.
- Generación de personajes, preferencias locales de accesibilidad, diseño adaptable, imágenes WebP, fuentes WOFF2 y PWA.
- Contrato HTTP que consume el frontend, proxy local, publicación y alcance de las pruebas.

## Abrir el proyecto del ZIP

1. Extrae el ZIP y abre `codigo/` en tu editor.
2. Arranca el backend Spring Boot en `http://localhost:8080`, con MariaDB configurada.
3. Instala las dependencias y arranca Vite desde `codigo/`:

```powershell
npm.cmd ci
npm.cmd run dev
```

Abre la dirección que muestre Vite y accede con tu cuenta. Puedes consultar también las instrucciones en el [README bilingüe](../README.md). El ZIP excluye backend, credenciales, datos de usuarios, dependencias instaladas, compilados e historial Git. En el ZIP, el README está en `codigo/README.md`.

## Herramientas y verificación

Los scripts versionados corresponden a la edición histórica. `generar_manual.py` contiene un temario, una fecha y una lista de fuentes antiguos. `exportar_pdf.mjs` conserva una fecha fija en el pie. Para esta edición se regeneraron los artefactos con herramientas temporales y se conservaron los scripts versionados.

`verificar_manual.py` compara los hashes y los listados HTML con los originales y comprueba la presencia de las líneas visibles en el PDF. `empaquetar_manual.py` crea el ZIP a partir del manifiesto y comprueba su integridad. El archivo `package-lock.json` viaja en el ZIP para reproducir la instalación. Los listados del manual se concentran en código, configuración, pruebas y documentación de lectura.

El manual refleja el contrato observado en el cliente. El código de Spring Boot, la configuración de MariaDB y las pruebas de extremo a extremo del backend quedan fuera de este repositorio.
