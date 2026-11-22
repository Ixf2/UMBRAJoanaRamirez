
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createFont, woff2 } from 'fonteditor-core'

const carpeta = 'public/fonts'

const fuentes = [
  'cormorant-garamond-regular',
  'cormorant-garamond-medium',
  'cormorant-garamond-italic',
  'inter-regular'
]

async function convertirFuentes() {
  await woff2.init()

  for (const nombre of fuentes) {
    const rutaEntrada = join(carpeta, `${nombre}.ttf`)
    const rutaSalida = join(carpeta, `${nombre}.woff2`)

    const datos = await readFile(rutaEntrada)

    const fuente = createFont(datos, {
      type: 'ttf',
      hinting: true
    })

    const resultado = fuente.write({
      type: 'woff2'
    })

    await writeFile(rutaSalida, resultado)

    const originalKB = (datos.length / 1024).toFixed(2)
    const nuevoKB = (resultado.length / 1024).toFixed(2)

    console.log(`${nombre}: ${originalKB} KB -> ${nuevoKB} KB`)
  }

  console.log('Conversión finalizada.')
}

convertirFuentes().catch(error => {
  console.error('Error convirtiendo las fuentes:', error)
  process.exitCode = 1
})
