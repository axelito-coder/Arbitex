import { useEffect, useState } from 'react'
import DetalleTurno from '../../components/DetalleTurno'
import '../../styles/Historial.css'

type Turno = {
  id: number
  fecha: string
  hora_carga: string
  cliente: string
  vehiculo: string
  tipo_service: string
  asesor: string
  estado: string
  duracion: number | null
  es_compensacion: boolean
}
function getClaseEstado(estado: string) {
  if (estado === 'finalizado')    return 'badge badge-verde'
  if (estado === 'en_proceso')    return 'badge badge-azul'
  if (estado === 'asignado')      return 'badge badge-naranja'
  if (estado === 'pendiente') return 'badge badge-gris-oscuro'
  return 'badge badge-gris'
}

function Historial() {
  const [turnoDetalle, setTurnoDetalle] = useState<number | null >(null) 
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroAsesor, setFiltroAsesor] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  useEffect(() => {
    async function  cargarHistorial() {
      try{
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3000/encargado/historial', {
          headers: { Authorization: `Bearer ${token}`}
        })
        const data = await res.json()
        if(res.ok){
          setTurnos(data)
        }
      }catch(err){
        console.error(err)
      }finally{
        setLoading(false)
      }
    }
    cargarHistorial()
  }, [])
  if(loading){
    return <p className='seccion-titulo'>Cargando...</p>
  }
const asesores = [...new Set(turnos.map(t => t.asesor).filter(Boolean))]
  const turnosFiltrados = turnos.filter((t) => {
    if (filtroAsesor !== 'Todos' && t.asesor !== filtroAsesor) return false
    if (filtroEstado !== 'Todos' && t.estado !== filtroEstado) return false
    
    return true
  })

  if(turnoDetalle){
    return(
      <DetalleTurno idTurno={turnoDetalle} onVolver={() => setTurnoDetalle(null)} urlBase='http://localhost:3000/encargado'/>
    )
  }
  return (
    <div className="historial">

      {/* FILTROS */}
      <div className="historial-filtros">

        <div className="filtro-campo">
          <label className="filtro-label">Asesor</label>
          <select className="filtro-select" value={filtroAsesor} onChange={(e) => setFiltroAsesor(e.target.value)}>
            <option value="">Todos los asesores</option>
            {asesores.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>

        <div className="filtro-campo">
          <label className="filtro-label">Estado</label>
          <select className="filtro-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="en_proceso">En proceso</option>
            <option value="finalizado">Finalizado</option>
            <option value="pendiente">Pendiente</option>
          </select>
        </div>


        <button className="filtro-limpiar" onClick={() => { setFiltroAsesor('Todos'); setFiltroEstado('Todos'); }}>
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
                  <tr key={t.id} onClick={() => setTurnoDetalle(t.id)} style={{cursor: 'pointer'}}>
                    <td>{t.fecha}</td>
                    <td>{t.hora_carga}</td>
                    <td>{t.cliente}</td>
                    <td>{t.vehiculo}</td>
                    <td>{t.tipo_service}</td>
                    <td>{t.asesor}</td>
                    <td><span className={getClaseEstado(t.estado)}>{t.estado}</span></td>
                    <td>{t.estado === 'finalizado' && t.duracion ? `${Math.round(Number(t.duracion))} min` : '-'}</td>
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