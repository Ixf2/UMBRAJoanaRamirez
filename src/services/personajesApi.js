const BASE_URL = '/api/personajes'

async function solicitar(url, opciones = {}) {
  const respuesta = await fetch(url, {
    credentials: 'same-origin',
    ...opciones
  })

  if (respuesta.status === 401) {
    throw new Error('Debes iniciar sesión de nuevo.')
  }

  if (respuesta.status === 403) {
    throw new Error('No tienes permiso para modificar este personaje.')
  }

  if (respuesta.status === 404) {
    throw new Error('El personaje o la categoría no existe.')
  }

  if (!respuesta.ok) {
    throw new Error(
      `Error del servidor (${respuesta.status}).`
    )
  }

  if (respuesta.status === 204) {
    return null
  }

  return respuesta.json()
}

export async function listarMisPersonajes() {
  return solicitar(`${BASE_URL}/mios`)
}

export async function crearPersonajeBD(datos) {
  return solicitar(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  })
}

export async function actualizarPersonajeBD(id, datos) {
  return solicitar(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  })
}

export async function eliminarPersonajeBD(id) {
  return solicitar(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  })
}

export async function subirRetratoBD(id, archivo) {
  const formulario = new FormData()
  formulario.append('archivo', archivo)

  return solicitar(`${BASE_URL}/${encodeURIComponent(id)}/imagen`, {
    method: 'POST',
    body: formulario
  })
}

export function urlMiniatura(id) {
  return `${BASE_URL}/${encodeURIComponent(id)}/imagen/miniatura`
}

export function urlDetalle(id) {
  return `${BASE_URL}/${encodeURIComponent(id)}/imagen/detalle`
}

export function adaptarPersonaje(personaje) {
  return {
    id: String(personaje.idPersonaje),
    name: personaje.nombre ?? '',
    type: personaje.clase || 'Guerrero',
    race: personaje.raza || 'Humana',
    level: personaje.nivel ?? 1,
    realm: personaje.origen ?? '',
    story: personaje.historia ?? '',
    personality: personaje.personalidad ?? '',
    stats: [
      personaje.fuerza ?? 10,
      personaje.destreza ?? 10,
      personaje.inteligencia ?? 10,
      personaje.carisma ?? 10
    ],
    traits: Array.isArray(personaje.rasgos)
      ? personaje.rasgos
      : [],
    portrait: personaje.retrato ?? 2,
    favorite: personaje.favorito === true,
    visibility: personaje.visibilidad ?? 'privado',
    idCategoria: personaje.idCategoria ?? 1,
    image: urlMiniatura(personaje.idPersonaje),
    imageDataUrl: '',
    imageName: '',
    updatedAt: Number(personaje.idPersonaje)
  }
}

export function prepararPersonaje(draft) {
  return {
    nombre: draft.name,
    historia: draft.story?.trim() || 'Historia pendiente de completar.',
    personalidad: draft.personality?.trim() || 'Sin definir.',
    imagen: null,
    fuerza: Number(draft.stats[0]),
    destreza: Number(draft.stats[1]),
    inteligencia: Number(draft.stats[2]),
    carisma: Number(draft.stats[3]),
    visibilidad: draft.visibility || 'privado',
    idCategoria: Number(draft.idCategoria || 1),
    clase: draft.type,
    raza: draft.race,
    nivel: Number(draft.level),
    origen: draft.realm || '',
    rasgos: draft.traits || [],
    retrato: Number(draft.portrait ?? 2),
    favorito: draft.favorite === true
  }
}
