export async function obtenerPersonajesPublicos() {
  const respuesta = await fetch('/api/personajes/publicos')

  if (!respuesta.ok) {
    throw new Error(`Error al obtener los personajes públicos: ${respuesta.status}`)
  }

  return respuesta.json()
}

export async function obtenerPersonajePorId(id) {
  const respuesta = await fetch(`/api/personajes/${encodeURIComponent(id)}`)

  if (!respuesta.ok) {
    throw new Error(`Error al obtener el personaje: ${respuesta.status}`)
  }

  return respuesta.json()
}
export async function registrarUsuario(datos) {
  const respuesta = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nombreUsuario: datos.name,
      email: datos.email,
      password: datos.password,
    }),
  })

  if (respuesta.status === 409) {
    throw new Error('Este correo electrónico ya está registrado.')
  }

  if (respuesta.status === 400) {
    throw new Error('Revisa los datos introducidos.')
  }

  if (!respuesta.ok) {
    throw new Error('No se pudo completar el registro.')
  }

  return respuesta.json()
}

export async function iniciarSesion(datos) {
  const respuesta = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: datos.email,
      password: datos.password,
    }),
  })

  if (respuesta.status === 401) {
    throw new Error('El correo o la contraseña son incorrectos.')
  }

  if (!respuesta.ok) {
    throw new Error('No se pudo iniciar sesión.')
  }

  return respuesta.json()
}

export async function obtenerSesion() {
  const respuesta = await fetch('/api/auth/me', {
    credentials: 'same-origin',
    headers: {
      'X-Requested-By': 'XMLHttpRequest',
    },
  })

  if (respuesta.status === 401) {
    return null
  }

  if (!respuesta.ok) {
    throw new Error('No se pudo comprobar la sesión.')
  }

  return respuesta.json()
}

export async function cerrarSesion() {
  const respuesta = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'same-origin',
  })

  if (!respuesta.ok) {
    throw new Error('No se pudo cerrar sesión.')
  }
}