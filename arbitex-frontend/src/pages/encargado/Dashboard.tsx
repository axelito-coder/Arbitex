import '../../styles/Dashboard.css'

// REEMPLAZAR POR DATOS REALES DE BACKEND
const resumen = [
  { label: 'Total del día', valor: 12 },
  { label: 'Asignados',     valor: 4  },
  { label: 'En proceso',    valor: 2  },
  { label: 'Finalizados',   valor: 5  },
  { label: 'Pendientes',    valor: 1  },
]

// REEMPLAZAR POR DATOS REALES DE BACKEND
const alertas = [
  { mensaje: 'Turno de Juan Pérez lleva 45 min sin atención', tipo: 'demora' },
  { mensaje: 'Turno de Ana Gómez sin asignar hace 20 min',    tipo: 'sin-asignar' },
]

// REEMPLAZAR POR DATOS REALES DE BACKEND
const turnos = [
  { hora: '08:00', cliente: 'María López',  service: 'Cambio de aceite',  asesor: 'Carlos R.', estado: 'Finalizado'    },
  { hora: '08:45', cliente: 'Carlos Ruiz',  service: 'Revisión frenos',   asesor: 'Laura M.',  estado: 'Finalizado'    },
  { hora: '09:30', cliente: 'Juan Pérez',   service: 'Service 10.000 km', asesor: 'Carlos R.', estado: 'En proceso'    },
  { hora: '10:00', cliente: 'Ana Gómez',    service: 'Cambio de aceite',  asesor: '-',         estado: 'Pendiente'     },
  { hora: '10:30', cliente: 'Luis Herrera', service: 'Revisión general',  asesor: 'Laura M.',  estado: 'Asignado'      },
]

function getClaseEstado(estado: string) {
  if (estado === 'Finalizado')  return 'badge badge-verde'
  if (estado === 'En proceso')  return 'badge badge-azul'
  if (estado === 'Asignado')    return 'badge badge-naranja'
  return 'badge badge-gris'
}

function Dashboard() {
  return (
    <div className="dashboard">

      {/* TARJETAS RESUMEN */}
      <div className="dashboard-tarjetas">
        {resumen.map((item) => (
          <div key={item.label} className="tarjeta">
            <p className="tarjeta-valor">{item.valor}</p>
            <p className="tarjeta-label">{item.label}</p>
          </div>
        ))}
      </div>

      {/* ALERTAS */}
      <div className="dashboard-seccion">
        <p className="seccion-titulo">Alertas activas</p>
        {alertas.map((alerta, i) => (
          <div key={i} className="alerta">
            ⚠ {alerta.mensaje}
          </div>
        ))}
      </div>

      {/* LISTA DE TURNOS */}
      <div className="dashboard-seccion">
        <p className="seccion-titulo">Turnos del día</p>
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Service</th>
                <th>Asesor</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {turnos.map((turno, i) => (
                <tr key={i}>
                  <td>{turno.hora}</td>
                  <td>{turno.cliente}</td>
                  <td>{turno.service}</td>
                  <td>{turno.asesor}</td>
                  <td><span className={getClaseEstado(turno.estado)}>{turno.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default Dashboard