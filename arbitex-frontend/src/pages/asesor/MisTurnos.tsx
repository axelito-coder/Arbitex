import '../../styles/MisTurnos.css'
import DetalleTurno from '../../components/DetalleTurno'
import { useEffect, useState } from 'react'

type Turno = {
  id: number
  fecha: string
  hora_carga: string
  cliente: string
  vehiculo: string
  tipo_service: string
  estado: string
  duracion_minutos: number | null
}


function getClaseEstado(estado: string) {
  if (estado === 'finalizado')     return 'badge badge-verde'
  if (estado === 'en_proceso')     return 'badge badge-azul'
  if (estado === 'asignado')       return 'badge badge-naranja'
  if (estado === 'no_presentado')  return 'badge badge-gris-oscuro'
  if (estado === 'anulado')        return 'badge badge-rojo'
  return 'badge badge-gris'
}
function formatearFecha(fechaISO: string){
  const fecha = new Date(fechaISO)
  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
function MisTurnos() {
  const [turnoDetalle, setTurnoDetalle] = useState<number | null>(null)
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [visibles, setVisibles] = useState(10);

  useEffect(() => {
    async function cargarTurnos() {
      try{
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/asesor/turnos/semana',{
        headers: { Authorization: `Bearer ${token}`}
      })
      const data = await res.json()
      if(res.ok){
        setTurnos(data)
      }
    }catch (err){
      console.error(err)
    }finally{
      setLoading(false)
    } 
   }
   cargarTurnos()
  }, [])
  
  
  // Contadores calculados en base a los turnos reales, no hardcodeados
  const finalizados = turnos.filter((t) => t.estado === 'finalizado').length
  const asignados = turnos.filter((t) => t.estado === 'asignado' || t.estado === 'En proceso').length
  const turnosFiltrados = turnos.filter((t) =>
    t.cliente.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase())
  )
  const turnosPaginados = turnosFiltrados.slice(0, visibles)

  if(loading){
    return <p className='seccion-titulo'>Cargando...</p>
  }

  if(turnoDetalle){
    return(
      <DetalleTurno idTurno={turnoDetalle} onVolver={() => setTurnoDetalle(null)} urlBase='http://localhost:3000/asesor'/>
    )
  }
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
          <p className="tarjeta-valor">{turnos.length}</p>
          <p className="tarjeta-label">Total semana</p>
        </div>
      </div>

      {/* TABLA SEMANAL */}
      <div className="mis-turnos-seccion">
        <p className="seccion-titulo">Turnos de la semana</p>
         <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="gestion-input"
              placeholder="Buscar por cliente..."
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setVisibles(10) }}
            />
            {busqueda && (
              <button className="gestion-btn-cancelar" onClick={() => { setBusqueda(''); setVisibles(10) }}>
                Limpiar
              </button>
            )}
          </div>
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha</th><th>Hora</th><th>Cliente</th><th>Vehículo</th><th>Service</th>
                <th>Estado</th><th>Duración</th>
              </tr>
            </thead>
            <tbody>
              {turnosFiltrados.length === 0 ? (
                <tr><td colSpan={6} className='sin-datos'>No tenes turnos esta semana...</td></tr>
              ): (
                turnosPaginados.map((t) => (
                <tr key={t.id} onClick={() => setTurnoDetalle(t.id)} style={{cursor: 'pointer'}}>
                  <td>{formatearFecha(t.fecha)}</td>
                  <td>{t.hora_carga ? new Date(t.hora_carga).toLocaleTimeString('es-AR', {hour: '2-digit', minute: '2-digit'}) : '-'}</td>
                  <td>{t.cliente}</td>
                  <td>{t.vehiculo}</td>
                  <td>{t.tipo_service}</td>
                  <td><span className={getClaseEstado(t.estado)}>{t.estado}</span></td>
                  {/* La duración solo aparece en turnos finalizados, según la guía */}
                  <td>{t.estado === 'finalizado' && t.duracion_minutos ? `${Math.round(t.duracion_minutos)} min` : '-'}</td>
                </tr>
              ))
              )}
            </tbody>
          </table>
           {visibles < turnosFiltrados.length && (
            <div className='ver-mas-contenedor'>
              <button className='btn-ver-mas' onClick={() => setVisibles(prev => prev + 10)}>
                ver más ({turnosFiltrados.length - visibles} restantes)
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default MisTurnos