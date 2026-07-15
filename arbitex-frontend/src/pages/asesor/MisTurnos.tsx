import '../../styles/MisTurnos.css'
import type { Turno } from '../../types'

// BACKEND: turnos de la semana actual, filtrados por asesor logueado
const turnosSemana: Turno[] = [
  { id: 1, hora: '08:00', cliente: 'María López', vehiculo: 'Fiat Cronos',
    service: 'Cambio de aceite', monto: 25000, estado: 'Finalizado', duracion: '32 min' },
  { id: 2, hora: '09:30', cliente: 'Juan Pérez', vehiculo: 'Toyota Corolla',
    service: 'Service 10.000 km', monto: 48000, estado: 'En proceso' },
  { id: 3, hora: '11:00', cliente: 'Marcos Díaz', vehiculo: 'VW Gol 2019',
    service: 'Cambio de aceite', monto: 25000, estado: 'Asignado' },
  { id: 4, hora: '10:15', cliente: 'Sofía Torres', vehiculo: 'Renault Sandero',
    service: 'Revisión frenos', monto: 32000, estado: 'Finalizado', duracion: '41 min' },
  { id: 5, hora: '14:00', cliente: 'Diego Ramos', vehiculo: 'Ford Ka',
    service: 'Alineación', monto: 18000, estado: 'No presentado' },
]

function getClaseEstado(estado: string) {
  if (estado === 'Finalizado')     return 'badge badge-verde'
  if (estado === 'En proceso')     return 'badge badge-azul'
  if (estado === 'Asignado')       return 'badge badge-naranja'
  if (estado === 'No presentado')  return 'badge badge-gris-oscuro'
  if (estado === 'Anulado')        return 'badge badge-rojo'
  return 'badge badge-gris'
}

function MisTurnos() {
  // Contadores calculados en base a los turnos reales, no hardcodeados
  const finalizados = turnosSemana.filter((t) => t.estado === 'Finalizado').length
  const asignados = turnosSemana.filter((t) => t.estado === 'Asignado' || t.estado === 'En proceso').length
  const acumulado = turnosSemana
    .filter((t) => t.estado === 'Finalizado')
    .reduce((suma, t) => suma + t.monto, 0)

  return (
    <div className="mis-turnos">

      {/* TARJETAS RESUMEN */}
      <div className="mis-turnos-tarjetas">
        <div className="tarjeta">
          <p className="tarjeta-valor">{finalizados}</p>
          <p className="tarjeta-label">Finalizados</p>
        </div>
        <div className="tarjeta">
          <p className="tarjeta-valor">{asignados}</p>
          <p className="tarjeta-label">Asignados</p>
        </div>
        <div className="tarjeta">
          <p className="tarjeta-valor">${acumulado.toLocaleString('es-AR')}</p>
          <p className="tarjeta-label">Acumulado semanal</p>
        </div>
      </div>

      {/* TABLA SEMANAL */}
      <div className="mis-turnos-seccion">
        <p className="seccion-titulo">Turnos de la semana</p>
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Hora</th><th>Cliente</th><th>Vehículo</th><th>Service</th>
                <th>Monto</th><th>Estado</th><th>Duración</th>
              </tr>
            </thead>
            <tbody>
              {turnosSemana.map((t) => (
                <tr key={t.id}>
                  <td>{t.hora}</td>
                  <td>{t.cliente}</td>
                  <td>{t.vehiculo}</td>
                  <td>{t.service}</td>
                  <td>${t.monto.toLocaleString('es-AR')}</td>
                  <td><span className={getClaseEstado(t.estado)}>{t.estado}</span></td>
                  {/* La duración solo aparece en turnos finalizados, según la guía */}
                  <td>{t.estado === 'Finalizado' ? t.duracion : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default MisTurnos