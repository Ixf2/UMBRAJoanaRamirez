import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Icon from '../components/icon/Icon.jsx'
import { validateForm } from '../utils/validateForm.js'
import './Login.css'

const fields = [
  { name: 'email', label: 'Correo electrónico', type: 'email', required: true },
  { name: 'password', label: 'Contraseña', type: 'password', required: true },
]

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (pending) return
    const form = event.currentTarget
    const nextErrors = validateForm(fields, new FormData(form))
    setErrors(nextErrors)
    setMessage('')
    const firstError = Object.keys(nextErrors)[0]
    if (firstError) {
      form.elements.namedItem(firstError).focus()
      return
    }
    setPending(true)
    try {
      const values = new FormData(form)
      await onLogin({ email: values.get('email'), password: values.get('password'), remember: values.has('remember') })
      navigate('/perfil', { replace: true })
    } catch (error) {
      setMessage(error.message || 'No se pudo acceder. Comprueba el almacenamiento del navegador.')
    } finally { setPending(false) }
  }

  return <section className="login-page" aria-labelledby="login-title">
    <div className="login-intro">
      <Icon name="sigil" size={60} />
      <h1 id="login-title">Cruza el umbral</h1>
      <p>Tus historias te esperan en la oscuridad.</p>
    </div>

    <div className="login-divider" aria-hidden="true"><span>❖</span></div>

    <p className="form-hint" id="login-notice">Accede a tu cuenta local de este navegador. Los campos con * son obligatorios.</p>
    <form className="login-form" noValidate aria-describedby="login-notice" onSubmit={handleSubmit}>
      <div className="login-field">
        <label htmlFor="login-email">Correo electrónico *</label>
        <div className="login-input">
          <Icon name="mail" size={18} />
          <input id="login-email" name="email" type="email" autoComplete="email" required maxLength={254}
            placeholder="Tu correo electrónico" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'login-email-error' : undefined} />
        </div>
        {errors.email && <p className="field-error" id="login-email-error" role="alert">{errors.email}</p>}
      </div>

      <div className="login-field">
        <label htmlFor="login-password">Contraseña *</label>
        <div className="login-input">
          <Icon name="lock" size={18} />
          <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required
            placeholder="Introduce tu contraseña" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'login-password-error' : undefined} />
          <button type="button" className="login-password-toggle" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? 'eye' : 'eye-off'} size={18} />
          </button>
        </div>
        {errors.password && <p className="field-error" id="login-password-error" role="alert">{errors.password}</p>}
      </div>

      <div className="login-options">
        <label className="login-remember"><input name="remember" type="checkbox" /> <span>Recordarme</span></label>
        <Link className="login-recovery" to="/recuperar">¿Olvidaste tu contraseña?</Link>
      </div>

      <button className="primary-button login-submit" type="submit" disabled={pending}><Icon name="login" size={18} />{pending ? 'Entrando…' : 'Iniciar sesión'}</button>
      {message && <p className="feedback error" role="alert">{message}</p>}
    </form>

    <div className="login-divider login-account-divider"><span>¿Aún no tienes una cuenta?</span></div>
    <Link className="login-create-account" to="/registro"><Icon name="user-plus" size={18} />Crear cuenta</Link>
    <p className="login-terms"><Link to="/privacidad">Privacidad y condiciones de uso</Link></p>
    <p className="login-motto">Cada alma tiene una historia.</p>
  </section>
}
