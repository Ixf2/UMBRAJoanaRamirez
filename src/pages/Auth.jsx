import { useState } from 'react'
import { Link } from 'react-router'
import AppForm from '../components/forms/AppForm.jsx'
import { recoverAccount } from '../utils/localAccounts.js'
import { registrarUsuario } from '../services/api.js'


const email = {
  name: 'email',
  label: 'Correo electrónico',
  type: 'email',
  required: true,
  autoComplete: 'email',
  maxLength: 100
}

const password = {
  name: 'password',
  label: 'Contraseña',
  type: 'password',
  required: true,
  minLength: 8,
  maxLength: 72,
  requireSpecial: true,
  autoComplete: 'new-password',
  hint: 'Al menos 8 caracteres y un carácter especial.'
}

const confirmation = {
  name: 'confirmPassword',
  label: 'Repetir contraseña',
  type: 'password',
  required: true,
  matches: 'password',
  autoComplete: 'new-password'
}


export default function Auth({ recovery = false }) {
  const [recovered, setRecovered] = useState(false)
  const [registrado, setRegistrado] = useState(false)
  const fields = recovery
    ? [
      email,
      {
        name: 'recoveryCode',
        label: 'Código de recuperación',
        required: true,
        maxLength: 32
      },
      password,
      confirmation
    ]
    : [
      {
        name: 'name',
        label: 'Nombre',
        required: true,
        minLength: 2,
        maxLength: 50,
        autoComplete: 'name'
      },
      email,
      password,
      confirmation
    ]


  async function submit(values) {
    const data = Object.fromEntries(values)

    if (recovery) {
      await recoverAccount(data)
      setRecovered(true)
    } else {
      await registrarUsuario(data)
      setRegistrado(true)
    }
  }

  return <section className="auth-page">
    {registrado ? (
      <div className="action-stack">
        <p className="feedback success" role="status">
          Tu cuenta se ha creado correctamente.
        </p>
        <Link className="primary-button" to="/login">
          Iniciar sesión
        </Link>
      </div>
    ) : recovered ? (
      <div className="action-stack">
        <p className="feedback success" role="status">
          Contraseña local actualizada.
        </p>
        <Link className="primary-button" to="/login">
          Iniciar sesión
        </Link>
      </div>
    ) : (
      <AppForm
        fields={fields}
        onSubmit={submit}
        submitLabel={recovery ? 'Cambiar contraseña' : 'Crear cuenta'}
        notice="Introduce tus datos para crear una cuenta de UMBRA."
      />
    )}
    

    {!registrado && !recovered && (
      <p className="account-link">
        ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
      </p>
    )}
  </section>
}

