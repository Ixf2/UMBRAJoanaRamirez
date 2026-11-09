export async function obtenerPersonajesPublicos() {
  const respuesta = await fetch('/api/personajes/publicos')

  if (!respuesta.ok) {
    throw new Error(`Error HTTP: ${respuesta.status}`)
  }

  return respuesta.json()
}