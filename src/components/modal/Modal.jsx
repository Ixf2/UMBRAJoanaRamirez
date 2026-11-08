import { useEffect, useId, useRef } from 'react'
import Icon from '../icon/Icon.jsx'

export default function Modal({ title, onClose, children }) {
  const dialog = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement
    element.showModal()
    return () => {
      element.close()
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [])

  return (
    <dialog ref={dialog} className="umbra-dialog" aria-labelledby={titleId}
      onClose={() => { if (!dialog.current.open) onClose() }}
      onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close() }}>
      <div className="dialog-content">
        <button className="icon-button dialog-close" aria-label="Cerrar diálogo" onClick={() => dialog.current.close()}><Icon name="close" /></button>
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </dialog>
  )
}
