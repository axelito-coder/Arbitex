import '../styles/Sidebar.css'

type Props = {
  pagina: string
  setPagina: (p: string) => void
  rol: string
}

function Sidebar({ pagina, setPagina, rol,}: Props) {

  const nombre = localStorage.getItem('nombre') || ''
  const linksAsesor = [
    { id: 'inicio',   label: 'Inicio'    },
    { id: 'turnos',   label: 'Mis Turnos'},
    { id: 'perfil',   label: 'Mi Perfil' },
  ]

  const linksEncargado = [
    { id: 'dashboard', label: 'Dashboard'      },
    { id: 'cargar',    label: 'Cargar Turno'   },
    { id: 'asesores',  label: 'Panel Asesores' },
    { id: 'historial', label: 'Historial'      },
    {id: 'asesores-gestion', label: 'Gestion Asesores'}
  ]

  const links = rol === 'encargado' ? linksEncargado : linksAsesor

   function cerrarSesion() {
    localStorage.removeItem('token')
    localStorage.removeItem('rol')
    localStorage.removeItem('nombre')
    window.location.reload()
  }

  return (
    <div className="sidebar">

      <div className="sidebar-logo">ARBITEX</div>

      {links.map((item) => (
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
        <p className="sidebar-rol-label">{rol === 'encargado' ? 'Encargado' : 'Asesor'}</p>
        <button className="btn-cerrar-sesion" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default Sidebar