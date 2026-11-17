import '../styles/Sidebar.css'

type Props = {
  pagina: string
  setPagina: (p: string) => void
  rol: string
}

function Sidebar({ pagina, setPagina, rol, }: Props) { //desde app se pasa como parametro o prop lo de la sesion (rol, nombre)

  const nombre = localStorage.getItem('nombre') || ''
  const linksAsesor = [ //los links que ven asesores
    { id: 'inicio', label: 'Inicio' },
    { id: 'turnos', label: 'Mis Turnos' },
    { id: 'perfil', label: 'Mi Perfil' },
  ]

  const linkRecepcionista = [ //los que ve el recepcionista
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'cargar', label: 'Cargar Turno' },
  ]

  const linksEncargado = [ // y los que ve el encargado
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'cargar', label: 'Cargar Turno' },
    { id: 'asesores', label: 'Panel Asesores' },
    { id: 'historial', label: 'Historial' },
    { id: 'asesores-gestion', label: 'Gestion Asesores' },
    { id: 'vehiculos-frecuentes', label: 'Vehículos frecuentes' },
    { id: 'clientes', label: 'Clientes' }
  ]

  function getLinks() {//
    if (rol === 'encargado') return linksEncargado
    if (rol === 'recepcionista') return linkRecepcionista
    return linksAsesor
  }
  function getRolLabel() {
    if (rol === 'encargado') return 'Encargado'
    if (rol === 'recepcionista') return 'Recepcionista'
    return 'Asesor'
  }

  function cerrarSesion() {
    localStorage.removeItem('token')
    localStorage.removeItem('rol')
    localStorage.removeItem('nombre')
    window.location.reload()
  }

  return (
    <div className="sidebar">

      <div className="sidebar-logo">
        <div className="sidebar-symbol">
          <div className="arrow-track-1">
            <svg width="28" height="28" viewBox="0 0 140 140" fill="none">
              <path d="M 70 15 A 55 55 0 0 1 120 93" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
              <polygon points="120,93 108,98 115,86" fill="#FFFFFF" />
            </svg>
          </div>
          <div className="arrow-track-2">
            <svg width="28" height="28" viewBox="0 0 140 140" fill="none">
              <path d="M 70 15 A 55 55 0 0 1 120 93" stroke="#EB0A1E" strokeWidth="3.5" strokeLinecap="round" />
              <polygon points="120,93 108,98 115,86" fill="#EB0A1E" />
            </svg>
          </div>
          <div className="center-dot-small"></div>
        </div>
        <span>ARBITEX</span>
      </div>
      {getLinks().map((item) => (
        <div
          key={item.id}
          onClick={() => setPagina(item.id)}
          className={`sidebar-link ${pagina === item.id ? 'activo' : ''}`}
        >
          {item.label}
        </div>
      ))}

      <div className="sidebar-footer">
        <p className="sidebar-nombre">{nombre}</p>
        <p className="sidebar-rol-label">{getRolLabel()}</p>
        <button className="btn-cerrar-sesion" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default Sidebar