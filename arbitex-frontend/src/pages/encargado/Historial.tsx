import { useState } from 'react'
import '../../styles/Historial.css'

// BACKEND: turnos de la semana
const turnosHistorial = [
  { id: 1, hora: '08:00', cliente: 'María López',  vehiculo: 'Fiat Cronos',      service: 'Cambio de aceite',  asesor: 'Carlos R.', estado: 'Finalizado',     duracion: '32 min', fecha: '2026-07-14' },
  { id: 2, hora: '08:45', cliente: 'Carlos Ruiz',  vehiculo: 'Toyota Corolla',   service: 'Revisión frenos',   asesor: 'Laura M.',  estado: 'Finalizado',     duracion: '28 min', fecha: '2026-07-14' },
  { id: 3, hora: '09:30', cliente: 'Juan Pérez',   vehiculo: 'Honda Civic',      service: 'Service 10.000 km', asesor: 'Carlos R.', estado: 'En proceso',     duracion: '-',      fecha: '2026-07-15' },
  { id: 4, hora: '10:00', cliente: 'Ana Gómez',    vehiculo: 'Renault Sandero',  service: 'Cambio de aceite',  asesor: '-',         estado: 'Pendiente',      duracion: '-',      fecha: '2026-07-15' },
  { id: 5, hora: '10:30', cliente: 'Luis Herrera', vehiculo: 'VW Gol',           service: 'Revisión general',  asesor: 'Sofía T.',  estado: 'Asignado',       duracion: '-',      fecha: '2026-07-16' },
  { id: 6, hora: '11:00', cliente: 'Diego Ramos',  vehiculo: 'Ford Ka',          service: 'Alineación',        asesor: 'Laura M.',  estado: 'No presentado',  duracion: '-',      fecha: '2026-07-16' },
  { id: 7, hora: '14:00', cliente: 'Sofía Torres', vehiculo: 'Peugeot 208',      service: 'Cambio de aceite',  asesor: 'Carlos R.', estado: 'Anulado',        duracion: '-',      fecha: '2026-07-17' },
]

const asesores = ['Todos', 'Carlos R.', 'Laura M.', 'Sofía T.']
const estados  = ['Todos', 'Finalizado', 'En proceso', 'Asignado', 'Pendiente', 'No presentado', 'Anulado']

function getClaseEstado(estado: string) {
  if (estado === 'Finalizado')    return 'badge badge-verde'
  if (estado === 'En proceso')    return 'badge badge-azul'
  if (estado === 'Asignado')      return 'badge badge-naranja'
  if (estado === 'Anulado')       return 'badge badge-rojo'
  if (estado === 'No presentado') return 'badge badge-gris-oscuro'
  return 'badge badge-gris'
}

function Historial() {
  const [filtroAsesor, setFiltroAsesor] = useState('Todos')
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [filtroFecha, setFiltroFecha]   = useState('')

  const turnosFiltrados = turnosHistorial.filter((t) => {
    if (filtroAsesor !== 'Todos' && t.asesor !== filtroAsesor) return false
    if (filtroEstado !== 'Todos' && t.estado !== filtroEstado) return false
    if (filtroFecha && t.fecha !== filtroFecha) return false
    return true
  })

  return (
    <div className="historial">

      {/* FILTROS */}
      <div className="historial-filtros">

        <div className="filtro-campo">
          <label className="filtro-label">Asesor</label>
          <select className="filtro-select" value={filtroAsesor} onChange={(e) => setFiltroAsesor(e.target.value)}>
            {asesores.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>

        <div className="filtro-campo">
          <label className="filtro-label">Estado</label>
          <select className="filtro-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            {estados.map((e) => <option key={e}>{e}</option>)}
          </select>
        </div>

        <div className="filtro-campo">
          <label className="filtro-label">Fecha</label>
          <input
            className="filtro-select"
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
          />
        </div>

        <button className="filtro-limpiar" onClick={() => { setFiltroAsesor('Todos'); setFiltroEstado('Todos'); setFiltroFecha('') }}>
          Limpiar filtros
        </button>

      </div>

      {/* TABLA */}
      <div className="historial-tabla">
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Vehículo</th>
                <th>Service</th>
                <th>Asesor</th>
                <th>Estado</th>
                <th>Duración</th>
              </tr>
            </thead>
            <tbody>
              {turnosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="sin-datos">No hay turnos con esos filtros</td>
                </tr>
              ) : (
                turnosFiltrados.map((t) => (
                  <tr key={t.id}>
                    <td>{t.fecha}</td>
                    <td>{t.hora}</td>
                    <td>{t.cliente}</td>
                    <td>{t.vehiculo}</td>
                    <td>{t.service}</td>
                    <td>{t.asesor}</td>
                    <td><span className={getClaseEstado(t.estado)}>{t.estado}</span></td>
                    <td>{t.duracion}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default Historial