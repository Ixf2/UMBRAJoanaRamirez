import { useEffect, useState } from 'react'

export default function ConnectionStatus() {
  const [message, setMessage] = useState(() => navigator.onLine ? '' : 'Sin conexión. Puedes seguir trabajando mientras la app esté abierta.')

  useEffect(() => {
    const offline = () => setMessage('Sin conexión. Puedes seguir trabajando mientras la app esté abierta.')
    const online = () => setMessage('Conexión restablecida.')
    window.addEventListener('offline', offline)
    window.addEventListener('online', online)
    return () => {
      window.removeEventListener('offline', offline)
      window.removeEventListener('online', online)
    }
  }, [])

  return <div className={message ? 'connection-status feedback' : 'visually-hidden'} role="status" aria-live="polite" aria-atomic="true">{message}</div>
}
