import { useEffect, useState } from 'react'
import '../../styles/Dashboard.css'

type Turno = {
  hora_carga: string
  cliente: string
  tipo_service: string
  asesor: string
  estado: string
  duracion: number | null
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

         const pendientes = data.filter((t: Turno) => t.estado === 'pendiente')
         const demorados = data.filter((t: Turno) => t.duracion !== null && t.duracion > 3 && t.estado === 'en_proceso')

        setAlertas([
         ...pendientes.map((t:Turno) =>({
         mensaje: `Turno de ${t.cliente} sin asignar`,
         tipo: 'Sin asignar'
        })),
         ...demorados.map((t: Turno) => ({
         mensaje: `${t.asesor} lleva ${Math.round(t.duracion!)} min atendiendo a ${t.cliente}`,
         tipo: 'demora'
        }))
  ])

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
    { label: 'Asignados',     valor: turnos.filter(t => t.estado === 'asignado').length },
    { label: 'En proceso',    valor: turnos.filter(t => t.estado === 'en_proceso').length },
    { label: 'Finalizados',   valor: turnos.filter(t => t.estado === 'finalizado').length },
    { label: 'Pendientes',    valor: turnos.filter(t => t.estado === 'pendiente').length },
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
                    <td>{turno.hora_carga ? new Date(turno.hora_carga).toLocaleTimeString('es-AR', {hour: '2-digit', minute: '2-digit'}) : '-'}</td>
                    <td>{turno.cliente}</td>
                    <td>{turno.tipo_service}</td>
                    <td>{turno.asesor || '-'}</td>
                    <td><span className={getClaseEstado(turno.estado)}>{turno.estado}</span></td>
                    <td>{turno.duracion ? `${Math.round(Number(turno.duracion))}min` : '-'}</td>
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