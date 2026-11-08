import { MAX_IMAGE_BYTES } from './characterStore.js'

export async function readPortrait(file) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > MAX_IMAGE_BYTES) {
    throw new Error('Selecciona una imagen PNG, JPG o WebP de hasta 750 KB.')
  }
  const imageDataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('No se pudo leer el retrato.'))
    reader.readAsDataURL(file)
  })
  await new Promise((resolve, reject) => {
    const preview = new Image()
    preview.onload = resolve
    preview.onerror = () => reject(new Error('El archivo no contiene una imagen válida.'))
    preview.src = imageDataUrl
  })
  return { imageDataUrl, imageName: file.name }
}
