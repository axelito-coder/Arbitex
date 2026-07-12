import '../../styles/Inicio.css'

//REEMPLAZAR POR DATOS REALES DE BACKEND

const turnoActual = {
  cliente: 'Juan Pérez',
  vehiculo: 'Toyota Corolla',
  service: 'Service 10.000 km',
  hora: '09:30',
  monto: '$85.000',
}

//REEMPLAZAR POR DATOS REALES DE BACKEND
const turnosDelDia = [
  { hora: '08:00', cliente: 'María López', service: 'Cambio de aceite', monto: '$42.000', estado: 'Finalizado' },
  { hora: '08:45', cliente: 'Carlos Ruiz', service: 'Revisión frenos', monto: '$67.000', estado: 'Finalizado' },
  { hora: '09:30', cliente: 'Juan Pérez', service: 'Service 10.000 km', monto: '$85.000', estado: 'En proceso' },
]

function getBadgeClass(estado: string) {
  if (estado === 'Finalizado') return 'badge badge-verde'
  if (estado === 'En proceso') return 'badge badge-azul'
  return 'badge badge-naranja'
}

function Inicio() {
  return (
    <div className="inicio">

      <div className="seccion">
        <p className="seccion-titulo">Turno actual</p>
        <div className="card-turno">
          <div className="card-info">
            <p className="card-cliente">{turnoActual.cliente}</p>
            <p className="card-detalle">{turnoActual.vehiculo} · {turnoActual.service}</p>
            <p className="card-detalle">🕐 {turnoActual.hora} hs</p>
            <button className="btn-iniciar">Iniciar atención</button>
          </div>
          <div className="card-monto">
            {turnoActual.monto}
            <span>monto estimado</span>
          </div>
        </div>
      </div>

      <div className="seccion">
        <p className="seccion-titulo">Mis turnos del día</p>
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Service</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {turnosDelDia.map((turno, i) => (
                <tr key={i} className={turno.estado === 'Finalizado' ? 'fila-opaca' : ''}>
                  <td>{turno.hora}</td>
                  <td>{turno.cliente}</td>
                  <td>{turno.service}</td>
                  <td>{turno.monto}</td>
                  <td><span className={getBadgeClass(turno.estado)}>{turno.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default Inicio