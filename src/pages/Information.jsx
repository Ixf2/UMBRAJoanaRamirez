import { Link } from 'react-router'

export function Help() {
  return <section className="information-page">
    <p>Umbra es un espacio para imaginar personajes, guardar sus fichas y dar vida a sus historias.</p>
    <details><summary>¿Cómo navego por Umbra?</summary><p>Usa el menú superior para acceder a todas las secciones y la barra inferior para Inicio, Biblioteca, Inspiración y Perfil.</p></details>
    <details><summary>¿Necesito iniciar sesión?</summary><p>Puedes crear y guardar personajes como invitado. Si creas una cuenta local, tendrás una biblioteca independiente en este navegador. Guarda el código de recuperación que aparece al registrarte.</p></details>
    <details><summary>¿Dónde se guardan mis personajes?</summary><p>En el almacenamiento de este navegador. No se sincronizan entre dispositivos. Desde Perfil puedes exportar una copia JSON y restaurarla en otro navegador o cuenta. Borrar los datos del sitio elimina las cuentas y las bibliotecas locales.</p></details>
    <details><summary>¿Cómo edito o elimino una ficha?</summary><p>Abre un personaje desde Inicio o Biblioteca. Su ficha tiene una pantalla propia con desplazamiento normal y un enlace para volver. Puedes marcarlo como favorito, editarlo, duplicarlo o eliminarlo. La confirmación para eliminar aparece dentro de la misma pantalla.</p></details>
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
