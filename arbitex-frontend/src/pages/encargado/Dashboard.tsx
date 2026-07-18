import { useEffect, useState } from 'react'
import '../../styles/Dashboard.css'

type Turno = {
  hora: string
  cliente: string
  tipo_service: string
  asesor: string
  estado: string
}

type Alerta = {
  mensaje: string
  tipo: string
}

function getClaseEstado(estado: string) {
  if (estado === 'finalizado')  return 'badge badge-verde'
  if (estado === 'en_proceso')  return 'badge badge-azul'
  if (estado === 'asignado')    return 'badge badge-naranja'
  return 'badge badge-gris'
}

function Dashboard() {
  const [turnos, setTurnos]   = useState<Turno[]>([])
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarDatos() {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3000/encargado/turnos/hoy', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setTurnos(data)

        // Generar alertas de turnos pendientes
        const pendientes = data.filter((t: Turno) => t.estado === 'Pendiente')
        setAlertas(pendientes.map((t: Turno) => ({
          mensaje: `Turno de ${t.cliente} sin asignar`,
          tipo: 'sin-asignar'
        })))

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  const resumen = [
    { label: 'Total del día', valor: turnos.length },
    { label: 'Asignados',     valor: turnos.filter(t => t.estado === 'Asignado').length },
    { label: 'En proceso',    valor: turnos.filter(t => t.estado === 'En proceso').length },
    { label: 'Finalizados',   valor: turnos.filter(t => t.estado === 'Finalizado').length },
    { label: 'Pendientes',    valor: turnos.filter(t => t.estado === 'Pendiente').length },
  ]

  if (loading) return <p className="seccion-titulo">Cargando...</p>

  return (
    <div className="dashboard">

      <div className="dashboard-tarjetas">
        {resumen.map((item) => (
          <div key={item.label} className="tarjeta">
            <p className="tarjeta-valor">{item.valor}</p>
            <p className="tarjeta-label">{item.label}</p>
          </div>
        ))}
      </div>

      {alertas.length > 0 && (
        <div className="dashboard-seccion">
          <p className="seccion-titulo">Alertas activas</p>
          {alertas.map((alerta, i) => (
            <div key={i} className="alerta">⚠ {alerta.mensaje}</div>
          ))}
        </div>
      )}

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
              {turnos.length === 0 ? (
                <tr><td colSpan={5} className="sin-datos">No hay turnos hoy</td></tr>
              ) : (
                turnos.map((turno, i) => (
                  <tr key={i}>
                    <td>{turno.hora}</td>
                    <td>{turno.cliente}</td>
                    <td>{turno.tipo_service}</td>
                    <td>{turno.asesor || '-'}</td>
                    <td><span className={getClaseEstado(turno.estado)}>{turno.estado}</span></td>
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

export default Dashboard