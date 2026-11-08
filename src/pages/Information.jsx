import { useState } from 'react'
import { Link } from 'react-router'
import Icon from '../components/icon/Icon.jsx'
import { randomCharacter } from '../data/characters.js'

const prompts = [
  'Tu personaje recibe una carta escrita con su propia letra, fechada cien años en el futuro. ¿Qué advertencia contiene?',
  'Una ciudad olvida el nombre de uno de sus habitantes cada amanecer. Hoy ha desaparecido el tuyo. ¿Quién te recuerda?',
  'La espada que heredaste se niega a herir a tu enemigo. ¿Qué secreto comparten?',
  'Un dragón te ofrece su último deseo a cambio de un recuerdo. ¿Qué estás dispuesto a perder?',
  'Todas las estatuas del reino han empezado a llorar. Una de ellas tiene tu rostro. ¿Qué anuncia?',
  'Tu sombra abandona tus pasos para proteger a alguien que nunca has visto. ¿La sigues?',
]

export function Inspiration() {
  const [prompt, setPrompt] = useState(0)
  const [character, setCharacter] = useState(randomCharacter)
  function generate() {
    setPrompt(index => (index + 1 + Math.floor(Math.random() * (prompts.length - 1))) % prompts.length)
    setCharacter(randomCharacter())
  }
  return <section className="inspiration-panel">
    <Icon name="sparkle" size={30} />
    <h2>El comienzo de una leyenda</h2>
    <p role="status">{prompts[prompt]}</p>
    <div className="inspiration-seed"><h2>{character.name}</h2><p>{character.race} · {character.type} · Nivel {character.level}</p><p>{character.traits.join(' · ')}</p></div>
    <button className="secondary-button" onClick={generate}>Otra inspiración</button>
    <Link className="primary-button" to="/crear-personaje" state={{ draft: { ...character, story: prompts[prompt] } }}>Crear a partir de esta idea</Link>
  </section>
}

export function Help() {
  return <section className="information-page">
    <p>Umbra es un espacio para imaginar personajes, guardar sus fichas y dar vida a sus historias.</p>
    <details><summary>¿Cómo navego por Umbra?</summary><p>Usa el menú superior para acceder a todas las secciones y la barra inferior para Inicio, Biblioteca, Inspiración y Perfil.</p></details>
    <details><summary>¿Necesito iniciar sesión?</summary><p>Puedes crear y guardar personajes como invitado. Si creas una cuenta local, tendrás una biblioteca independiente en este navegador. Guarda el código de recuperación que aparece al registrarte.</p></details>
    <details><summary>¿Dónde se guardan mis personajes?</summary><p>En el almacenamiento de este navegador. No se sincronizan entre dispositivos. Desde Perfil puedes exportar una copia JSON y restaurarla en otro navegador o cuenta. Borrar los datos del sitio elimina las cuentas y las bibliotecas locales.</p></details>
    <details><summary>¿Cómo edito o elimino una ficha?</summary><p>Abre un personaje desde Inicio o Biblioteca. En su ficha puedes marcarlo como favorito, editarlo, duplicarlo o eliminarlo. Se pide confirmación antes de eliminar.</p></details>
    <details><summary>¿Qué ocurre si pierdo la conexión?</summary><p>Se muestra un aviso y puedes seguir trabajando mientras la app esté abierta. Para volver a cargarla necesitas conexión al sitio o tener el servidor local en marcha.</p></details>
    <details><summary>¿Cómo recupero mi contraseña?</summary><p>Abre «¿Olvidaste tu contraseña?» e introduce tu correo y el código que guardaste al crear la cuenta. La recuperación es local y no envía correos. Si borraste los datos del navegador, necesitarás crear otra cuenta e importar tu copia de personajes.</p></details>
    <details><summary>¿Cómo mejoro la legibilidad?</summary><p>En Accesibilidad puedes aumentar el contraste y el tamaño del texto. La interfaz también respeta la preferencia del sistema de reducir el movimiento.</p></details>
    <Link className="secondary-button" to="/accesibilidad">Abrir Accesibilidad</Link>
    <Link className="inline-link" to="/inicio">Volver a Inicio</Link>
  </section>
}

export function Privacy() {
  return <section className="information-page">
    <h2>Datos en tu navegador</h2>
    <p>UMBRA guarda personajes, retratos, favoritos, preferencias y cuentas en el almacenamiento local del navegador. No envía estos datos a un servidor ni los sincroniza entre dispositivos.</p>
    <p>Las cuentas locales permiten organizar bibliotecas independientes en este navegador. El código que recibes al registrarte sirve para recuperar el acceso si olvidas tu contraseña. No se envían correos y las copias de seguridad no incluyen las credenciales.</p>
    <h2>Conservar tus historias</h2>
    <p>Exporta una copia desde Perfil antes de borrar los datos del sitio o cambiar de navegador. La copia incluye las fichas y sus retratos, sin cuentas ni contraseñas. Usa solo imágenes que tengas permiso para utilizar.</p>
    <Link className="secondary-button" to="/perfil">Ir a Perfil</Link>
  </section>
}

export function NotFound() {
  return <section className="information-page error-page">
    <p className="error-code" aria-hidden="true">404</p>
    <h2>Este camino no lleva a ninguna historia</h2>
    <p>La dirección no existe o ha cambiado. Puedes volver a Inicio o consultar Ayuda para continuar.</p>
    <Link className="primary-button" to="/inicio">Volver a Inicio</Link>
    <Link className="secondary-button" to="/ayuda">Consultar Ayuda</Link>
  </section>
}
