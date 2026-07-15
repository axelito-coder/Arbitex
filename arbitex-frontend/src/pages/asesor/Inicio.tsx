import '../../styles/Inicio.css'
import type { Turno } from '../../types'

// BACKEND: vendría del login
const asesorActual = 'Carlos R.'

// BACKEND: turno que el sistema le asignó en este momento (o null si no hay ninguno esperando)
const turnoActual: Turno | null = {
  id: 5, hora: '11:00', cliente: 'Marcos Díaz', vehiculo: 'VW Gol 2019',
  service: 'Cambio de aceite', monto: 25000, estado: 'Asignado'
}

// BACKEND: turnos que ya le fueron asignados hoy (no incluye futuros: el sistema asigna en tiempo real)
const misTurnosHoy: Turno[] = [
  { id: 1, hora: '08:00', cliente: 'María López', vehiculo: 'Fiat Cronos',
    service: 'Cambio de aceite', monto: 25000, estado: 'Finalizado' },
  { id: 2, hora: '09:30', cliente: 'Juan Pérez', vehiculo: 'Toyota Corolla',
    service: 'Service 10.000 km', monto: 48000, estado: 'En proceso' },
]

function getClaseEstado(estado: string) {
  if (estado === 'Finalizado') return 'badge badge-verde'
  if (estado === 'En proceso') return 'badge badge-azul'
  if (estado === 'Asignado') return 'badge badge-naranja'
  return 'badge badge-gris'
}

function iniciarAtencion() {
  // BACKEND: PATCH del turno actual -> estado 'En proceso'
  console.log('Iniciar atención del turno', turnoActual?.id)
}

function Inicio() {
  return (
    <div className="inicio">

      <p className="inicio-saludo">Hola, {asesorActual} 👋</p>

      {/* TURNO ACTUAL — card destacada con borde rojo */}
      {turnoActual ? (
        <div className="turno-actual">
          <p className="turno-actual-label">Turno actual</p>

          <div className="turno-actual-datos">
            <div>
              <p className="turno-actual-cliente">{turnoActual.cliente}</p>
              <p className="turno-actual-detalle">{turnoActual.vehiculo} · {turnoActual.service}</p>
            </div>
            <div className="turno-actual-extra">
              <p className="turno-actual-hora">{turnoActual.hora}</p>
              <p className="turno-actual-monto">${turnoActual.monto.toLocaleString('es-AR')}</p>
            </div>
          </div>

          {/* El botón solo tiene sentido si todavía no arrancó la atención */}
          {turnoActual.estado === 'Asignado' && (
            <button className="btn-iniciar" onClick={iniciarAtencion}>
              Iniciar atención
            </button>
          )}
        </div>
      ) : (
        <div className="turno-espera">Esperando asignación de turno...</div>
      )}

      {/* TURNOS YA ASIGNADOS HOY */}
      <div className="inicio-seccion">
        <p className="seccion-titulo">Turnos de hoy</p>

        {misTurnosHoy.length === 0 ? (
          <p className="sin-datos">No tenés turnos asignados hoy.</p>
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Hora</th><th>Cliente</th><th>Service</th><th>Monto</th><th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {misTurnosHoy.map((t) => (
                  // Los finalizados aparecen con menor opacidad (pide la guía)
                  <tr key={t.id} className={t.estado === 'Finalizado' ? 'fila-opaca' : ''}>
                    <td>{t.hora}</td>
                    <td>{t.cliente}</td>
                    <td>{t.service}</td>
                    <td>${t.monto.toLocaleString('es-AR')}</td>
                    <td><span className={getClaseEstado(t.estado)}>{t.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

export default Inicio