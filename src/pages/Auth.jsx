import { useState } from 'react'
import { Link } from 'react-router'
import AppForm from '../components/forms/AppForm.jsx'
import { recoverAccount, registerAccount } from '../utils/localAccounts.js'

const email = { name: 'email', label: 'Correo electrónico', type: 'email', required: true, autoComplete: 'email', maxLength: 254 }
const password = { name: 'password', label: 'Contraseña', type: 'password', required: true, minLength: 8, maxLength: 256, requireSpecial: true, autoComplete: 'new-password', hint: 'Al menos 8 caracteres y un carácter especial, como !, @, # o $.' }
const confirmation = { name: 'confirmPassword', label: 'Repetir contraseña', type: 'password', required: true, matches: 'password', autoComplete: 'new-password' }

export default function Auth({ recovery = false }) {
  const [recoveryCode, setRecoveryCode] = useState('')
  const [recovered, setRecovered] = useState(false)
  const fields = recovery ? [email, { name: 'recoveryCode', label: 'Código de recuperación', required: true, maxLength: 32, hint: 'El código que guardaste al crear tu cuenta local.' }, password, confirmation] : [
    { name: 'name', label: 'Nombre', required: true, minLength: 2, maxLength: 60, autoComplete: 'name' },
    email, password, confirmation,
    { name: 'localAcknowledged', label: 'Entiendo que la cuenta y mis personajes se guardan solo en este navegador.', type: 'checkbox', required: true },
  ]

  async function submit(values) {
    const data = Object.fromEntries(values)
    if (recovery) {
      await recoverAccount(data)
      setRecovered(true)
    } else {
      setRecoveryCode(await registerAccount(data))
    }
  }

  return <section className="auth-page">
    {recoveryCode ? <div className="action-stack">
      <p className="feedback success" role="status">Tu cuenta local está creada. Guarda este código antes de continuar: lo necesitarás si olvidas la contraseña.</p>
      <label className="form-field">Código de recuperación<input aria-label="Código de recuperación" readOnly value={recoveryCode} onFocus={event => event.target.select()} /></label>
      <p className="form-hint">Guárdalo en un lugar seguro. No podemos recuperarlo ni enviarlo por correo.</p>
      <Link className="primary-button" to="/login">Ya he guardado el código. Iniciar sesión</Link>
    </div> : recovered ? <div className="action-stack"><p className="feedback success" role="status">Contraseña actualizada. Ya puedes entrar con la nueva contraseña.</p><Link className="primary-button" to="/login">Iniciar sesión</Link></div> : <AppForm fields={fields} onSubmit={submit} submitLabel={recovery ? 'Cambiar contraseña' : 'Crear cuenta local'} notice="La cuenta funciona en este navegador. No se envían correos ni se sincronizan datos entre dispositivos." />}
    {!recoveryCode && !recovered && <p className="account-link">¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>}
    <Link className="inline-link" to="/privacidad">Privacidad y uso</Link>
  </section>
}
