import { Link } from 'react-router'

export default function Hero() {
  return <section className="hero" aria-labelledby="hero-title">
    <div className="hero-landscape" role="img" aria-label="Castillo entre montañas y niebla" />
    <div className="hero-copy">
      <p className="welcome">Bienvenido a Umbra</p>
      <h1 id="hero-title">Que tus historias<br />nunca se apaguen.</h1>
      <p className="hero-description">Aquí comienza tu leyenda.</p>
      <Link className="primary-button" to="/crear-personaje"><span aria-hidden="true">＋</span> Crear personaje</Link>
    </div>
  </section>
}
