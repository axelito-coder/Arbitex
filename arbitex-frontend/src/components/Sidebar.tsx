import '../styles/Sidebar.css'

type Props = {
  pagina: string
  setPagina: (p: string) => void
  rol: string
}

function Sidebar({ pagina, setPagina, rol,}: Props) {

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
  ]

  const links = rol === 'encargado' ? linksEncargado : linksAsesor

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
    </div>
  )
}

export default Sidebar