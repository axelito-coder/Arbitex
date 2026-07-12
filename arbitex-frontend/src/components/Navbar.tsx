import '../styles/Navbar.css'

type Props = {
  sidebar: boolean
  setSidebar: (s: boolean) => void
  pagina: string
}

function Navbar({ sidebar, setSidebar, pagina }: Props) {
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

    </div>
  )
}

export default Navbar