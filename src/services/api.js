export async function obtenerPersonajePorId(id) {
  const respuesta = await fetch(`/api/personajes/${encodeURIComponent(id)}`)

  if (!respuesta.ok) {
    throw new Error(`Error al obtener el personaje: ${respuesta.status}`)
  }

  return respuesta.json()
}