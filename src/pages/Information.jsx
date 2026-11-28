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
    <h2>Cuenta y sesión</h2>
    <p>Al registrarte, UMBRA envía tu nombre de usuario, correo electrónico y contraseña al servidor para crear tu cuenta. Al iniciar sesión, envía tu correo y contraseña para comprobar el acceso. El navegador usa una cookie de sesión para identificarte. Puedes cerrar la sesión desde Perfil.</p>
    <p>La recuperación mediante código solo funciona con las cuentas locales de versiones anteriores.</p>
    <h2>Personajes y visibilidad</h2>
    <p>El servidor guarda en MariaDB tus fichas, favoritos y los retratos que subes. Puedes consultar tu biblioteca al iniciar sesión con la misma cuenta en otro navegador o dispositivo.</p>
    <p>Las fichas privadas aparecen en tu biblioteca personal. Las fichas públicas pueden mostrarse en el catálogo para que otras personas consulten su contenido y retrato. Puedes cambiar la visibilidad, editar o eliminar una ficha desde tu biblioteca. Usa imágenes que tengas permiso para utilizar.</p>
    <h2>Preferencias del navegador</h2>
    <p>Los ajustes de apariencia y accesibilidad se guardan en este navegador por perfil, incluido un perfil para visitantes. Si borras los datos del sitio, se restablecen esos ajustes y tendrás que volver a iniciar sesión para acceder a tu biblioteca.</p>
    <h2>Copias de seguridad</h2>
    <p>En Perfil puedes descargar una copia JSON con los datos de tus fichas y sus favoritos. El archivo puede contener historias y otros datos que hayas escrito en las fichas. La exportación excluye las credenciales de la cuenta y los archivos de retratos almacenados en MariaDB.</p>
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
