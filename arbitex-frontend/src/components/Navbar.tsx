import '../styles/Navbar.css'

type Props = {
  sidebar: boolean
  setSidebar: (s: boolean) => void
  pagina: string
  tema: string
  setTema: (t: string) => void
}

function IconoSol() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 1.8v2.4M12 19.8v2.4M4.4 4.4l1.7 1.7M17.9 17.9l1.7 1.7M1.8 12h2.4M19.8 12h2.4M4.4 19.6l1.7-1.7M17.9 6.1l1.7-1.7" />
    </svg>
  )
}

function IconoLuna() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 14.3A8.6 8.6 0 0 1 9.7 3.5a8.6 8.6 0 1 0 10.8 10.8z" />
    </svg>
  )
}

function Navbar({ sidebar, setSidebar, pagina, tema, setTema }: Props) {
  const oscuro = tema === 'oscuro'

  return (
    <div className="navbar">

      <button
        className="navbar-boton"
        onClick={() => setSidebar(!sidebar)}
      >
        ☰
      </button>

      <span className="navbar-titulo">
        {pagina === 'inicio' ? 'Inicio' : pagina === 'turnos' ? 'Mis Turnos' : 'Mi Perfil'}
      </span>

      <button
        className="navbar-tema"
        onClick={() => setTema(oscuro ? 'claro' : 'oscuro')}
        title={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        <span key={tema} className="navbar-tema-icono">
          {oscuro ? <IconoSol /> : <IconoLuna />}
        </span>
      </button>

    </div>
  )
}

export default Navbar
