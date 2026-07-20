import { useEffect, useState } from "react";
import '../../styles/Inicio.css'
import FinalizarTurno from "./FinalizarTurno";
type Turno = {
  id: number,
  hora_carga: string,
  cliente: string,
  vehiculo: string,
  tipo_service: string,
  monto: number,
  estado: string
}

function getClaseEstado(estado: string){
  if(estado === 'finalizado'){
    return 'badge badge-verde'
  }
  if(estado === 'en_proceso'){
    return 'badge badge-azul'
  }
  if(estado === 'asignado'){
    return 'badge badge-naranja'
  }
  return 'badge badge-gris'
}

function Inicio(){
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [turnoActual, setTurnoActual] = useState<Turno | null>(null)
  const [turnoFinalizando, setTurnoFinalizando] = useState<Turno | null>(null)
  const [loading, setLoading] = useState(true)
  const nombre = localStorage.getItem('nombre') || 'Asesor'

  useEffect(() => {
    CargarTurnos()
  }, [])

  async function  CargarTurnos() {
    try{
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/asesor/turnos/hoy', {
        headers: { Authorization: `Bearer ${token}`}
      })
      const data = await res.json()

      if(!res.ok) return

      setTurnos(data)

      //El turno actual es el primero en estado asignado
      const actual = data.find((t: Turno) => t.estado === 'asignado' || t.estado === 'en_proceso') || null
      setTurnoActual(actual)
    }catch(err){
      console.error(err)
    }finally{
      setLoading(false)
    }
  }

  async function iniciarAtencion(){
    if(!turnoActual) return

    try{
      const token = localStorage.getItem('token')
      await fetch(`http://localhost:3000/asesor/turnos/${turnoActual.id}/iniciar`,{
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`}
      })
      CargarTurnos()
    }catch(err){
      console.error(err)
    }
  }

  if(loading){
    return <p className="seccion-titulo">Cargando...</p>
  }

  if (turnoFinalizando) {
  return (
    <FinalizarTurno
      idTurno={turnoFinalizando.id}
      cliente={turnoFinalizando.cliente}
      tipoService={turnoFinalizando.tipo_service}
      onFinalizado={() => {
        setTurnoFinalizando(null)
        CargarTurnos()
      }}
      onCancelar={() => setTurnoFinalizando(null)}
    />
  )
}
  return(
    <div className="inicio">
      <p className="inicio-saludo">Hola, {nombre} 👋</p>
      {
        turnoActual ? (
          <div className="turno-actual">
            <p className="turno-actual-label">Turno actual</p>
            <div className="turno-actual-datos">
              <div>
                <p className="turno-actual-cliente">{turnoActual.cliente}</p>
                <p className="turno-actual-detalle">{turnoActual.vehiculo} * {turnoActual.tipo_service}</p>
              </div>
            </div>
            {turnoActual.estado === 'asignado' && (
              <button className="btn-iniciar" onClick={iniciarAtencion}>Iniciar Atención</button>
            )}

            {turnoActual.estado === 'en_proceso' && (
              <button className="btn-finalizar" onClick={() => setTurnoFinalizando(turnoActual)}>Finalizar atencion</button>
            )}

          </div>
        ) : (
          <div className="turno-espera">Esperando asignación de turno...</div>
        )}

        <div className="inicio-seccion">
          <p className="seccion-titulo">Turnos de hoy</p>
          {
            turnos.length === 0 ?(
              <p className="sin-datos">No tenes turnos asignados hoy</p>
            ) : (
              <div className="tabla-contenedor">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Hora</th><th>Cliente</th><th>Service</th><th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turnos.map((t) => (
                      <tr key={t.id} className={t.estado === 'finalizado' ? 'fila-opaca' : ''}>
                        <td>{t.hora_carga ? new Date(t.hora_carga).toLocaleTimeString('es-AR', {hour: '2-digit', minute: '2-digit'}) : '-'}</td>
                        <td>{t.cliente}</td>
                        <td>{t.tipo_service}</td>
                        <td><span className={getClaseEstado(t.estado)}>{t.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
    </div>
  )
}

export default Inicio