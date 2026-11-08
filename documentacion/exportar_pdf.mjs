// Prints the generated manual with a local Chrome/Edge instance using CDP.
import { readFile, writeFile } from 'node:fs/promises'
import { Buffer } from 'node:buffer'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'
import process from 'node:process'

const directory = dirname(fileURLToPath(import.meta.url))
const htmlPath = join(directory, 'UMBRA-manual-completo.html')
const pdfPath = join(directory, 'UMBRA-manual-completo.pdf')
const manifest = JSON.parse(await readFile(join(directory, 'manifiesto.json'), 'utf8'))
const port = process.env.UMBRA_PDF_CDP_PORT || '9223'
const info = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()
const socket = new WebSocket(info.webSocketDebuggerUrl)
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
let sequence = 0
let sessionId
let browserContextId
const pending = new Map()
socket.onmessage = event => {
  const message = JSON.parse(event.data)
  const operation = pending.get(message.id)
  if (!operation) return
  pending.delete(message.id)
  if (message.error) operation.reject(new Error(message.error.message))
  else operation.resolve(message.result)
}
function send(method, params = {}, session = sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++sequence
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }))
  })
}
async function evaluate(expression) {
  const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails))
  return response.result.value
}

try {
  ;({ browserContextId } = await send('Target.createBrowserContext', { disposeOnDetach: true }, null))
  const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId }, null)
  ;({ sessionId } = await send('Target.attachToTarget', { targetId, flatten: true }, null))
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Page.navigate', { url: pathToFileURL(htmlPath).href })
  let loaded = false
  for (let attempt = 0; attempt < 100; attempt++) {
    loaded = await evaluate("document.readyState === 'complete' && document.querySelectorAll('.source').length > 0")
    if (loaded) break
    await delay(100)
  }
  if (!loaded) throw new Error('The HTML manual did not finish loading.')
  await evaluate('document.fonts.ready.then(() => true)')
  const coverage = await evaluate(`(() => {
    const sources = [...document.querySelectorAll('.source')];
    const brokenImages = [...document.images].filter(image => !image.complete || !image.naturalWidth).length;
    return {files:sources.length, lines:sources.reduce((total, source) => total + source.querySelectorAll('.source-line').length, 0), brokenImages, fonts:document.fonts.status};
  })()`)
  if (coverage.files !== manifest.source_files || coverage.lines !== manifest.source_lines || coverage.brokenImages) throw new Error(`Source coverage failed: ${JSON.stringify(coverage)}`)
  const result = await send('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    generateTaggedPDF: true,
    generateDocumentOutline: true,
    headerTemplate: '<div style="font-family:Arial,sans-serif;font-size:9px;color:#62726b;width:100%;padding:0 16mm;">UMBRA · Manual funcional y código fuente</div>',
    footerTemplate: '<div style="font-family:Arial,sans-serif;font-size:9px;color:#62726b;width:100%;padding:0 16mm;display:flex;justify-content:space-between;"><span>Edición 08/11/2026</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
  })
  const pdf = Buffer.from(result.data, 'base64')
  if (pdf.subarray(0, 5).toString() !== '%PDF-') throw new Error('The browser did not return a PDF.')
  await writeFile(pdfPath, pdf)
  const contents = pdf.toString('latin1')
  const pageCount = (contents.match(/\/Type\s*\/Page\b/g) || []).length
  await writeFile(join(directory, 'verificacion.json'), JSON.stringify({
    pdf: 'UMBRA-manual-completo.pdf', bytes: pdf.length, pages: pageCount,
    included_files: coverage.files, included_lines: coverage.lines, fonts_loaded: coverage.fonts,
    broken_images: coverage.brokenImages, tagged_pdf: contents.includes('/StructTreeRoot'),
    outline: contents.includes('/Outlines'),
  }, null, 2))
  console.log(JSON.stringify({ pdf: pdfPath, bytes: pdf.length, pages: pageCount, coverage }))
} finally {
  if (browserContextId) await send('Target.disposeBrowserContext', { browserContextId }, null)
  socket.close()
}
