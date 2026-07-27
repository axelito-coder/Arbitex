import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import '../../styles/MiPerfil.css'


//En typescript cuando hacemos type ... definimos como debe ser un objeto
//Cuando typescript compila el codigo a javascript, los types no existen mas, solo sirven para detectar errores y hacer las coas mas limpias
type Perfil = {
  nombre: string
  acumulado_semanal: number
  tiempo_promedio: number
  orden_compensacion: number
  comision: number
  acumulado_por_dia: {fecha: string, total: number}[]
}

type Turno = {
  id: number
  cliente: string
  duracion_minutos: number | null
  estado: string
  fecha: string
}

function MiPerfil() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [grafico, setGrafico] = useState<'acumulado' | 'tiempos'>('acumulado')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarDatos() {
      try{
        const token = localStorage.getItem('token')

        const[resPerfil, resTurnos] = await Promise.all([
          fetch('http://localhost:3000/asesor/perfil', {
            headers: {Authorization: `Bearer ${token}`}
          }),
          fetch('http://localhost:3000/asesor/turnos/semana',{
            headers: { Authorization: `Bearer ${token}`}
          })
        ])
        const dataPerfil = await resPerfil.json()
        const dataTurnos = await resTurnos.json()

        if(resPerfil.ok){
          setPerfil(dataPerfil)
        }
        if(resTurnos.ok){
          setTurnos(dataTurnos)
        }
      }catch(err){
        console.error(err)
      }finally{
        setLoading(false)
      }
    }
    cargarDatos()
  }, [])

  if(loading){
    return <p className='seccion-titulo'>Cargando...</p>
  }
  if(!perfil){
    return <p className='seccion-titulo'>Error al cargar perfil</p>
  }

  const turnosFinalizados = turnos.filter(t => t.estado === 'finalizado')
  const promedioEquipo = 20

  const tiemposPorTurno = turnosFinalizados.map(t => ({
    turno: t.cliente,
    minutos: t.duracion_minutos ? Math.round(t.duracion_minutos) : 0
  }))
  
  return (
    <div className="mi-perfil">

      {/* HEADER */}
      <div className="perfil-header">
        <div className="perfil-avatar">{perfil.nombre.charAt(0)}</div>
        <div>
          <p className="perfil-nombre">{perfil.nombre}</p>
          <p className="perfil-rol">Asesor de servicio</p>
        </div>
      </div>

      {/* TARJETAS */}
      <div className="perfil-tarjetas">
        <div className="tarjeta">
          <p className="tarjeta-valor">${perfil.acumulado_semanal.toLocaleString('es-AR')}</p>
          <p className="tarjeta-label">Acumulado semanal</p>
        </div>
        <div className="tarjeta">
          <p className="tarjeta-valor">${Number(perfil.comision).toLocaleString('es-AR')}</p>
          <p className="tarjeta-label">Comisión generada</p>
        </div>
        <div className="tarjeta">
          <p className="tarjeta-valor">{turnos.length}</p>
          <p className="tarjeta-label">Turnos de la semana</p>
        </div>
        <div className="tarjeta">
          {/* Se pinta naranja si el asesor supera el promedio del equipo */}
          <p className={`tarjeta-valor ${perfil.tiempo_promedio > promedioEquipo ? 'valor-alerta' : ''}`}>
            {perfil.tiempo_promedio} min
          </p>
          <p className="tarjeta-label">Tiempo promedio</p>
        </div>
      </div>

      {/* GRAFICOS */}
      <div className="perfil-seccion">
        <div className="grafico-botones">
          <button
            className={`btn-grafico ${grafico === 'acumulado' ? 'activo' : ''}`}
            onClick={() => setGrafico('acumulado')}
          >
            Acumulado
          </button>
          <button
            className={`btn-grafico ${grafico === 'tiempos' ? 'activo' : ''}`}
            onClick={() => setGrafico('tiempos')}
          >
            Tiempos
          </button>
        </div>

        {grafico === 'acumulado' && (
          <div>
            <p style={{ fontSize: 13, color: '#595959', marginBottom: 16}}>Acumulado por día</p>
            {perfil.acumulado_por_dia.length === 0 ? (
              <p style={{fontSize: 13, color: '#595959', textAlign: 'center', padding: 32}}> 
              No hay turnos finalizados esta semana
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={perfil.acumulado_por_dia}>
                  <CartesianGrid strokeDasharray="3 3" stroke='#E0E0E0' vertical={false}/>
                  <XAxis dataKey="fecha" tick={{fontSize: 12, fill: '#595959'}} axisLine={false} tickLine={false}
                  tickFormatter={(v) => {
                    const fecha = new Date(v)
                    return fecha.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', timeZone: 'America/Argentina/Buenos_Aires'})
                  }}/>
                  <YAxis hide/>
                  <Tooltip labelFormatter={(v) => {
                    const fecha = new Date(v)
                    return fecha.toLocaleDateString('es-AR', {weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Argentina/Buenos_Aires'})
                  }}
                   formatter={(value) => typeof value === 'number' ? [`$${value.toLocaleString('es-AR')}`, 'Acumulado'] : [value, '']}/>
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="total" position="top" formatter={(v: unknown) => typeof v === 'number' ? `$${v.toLocaleString('es-AR')}` : ''} style={{ fontSize: 11, fill: '#595959'}}/>
                    {perfil.acumulado_por_dia.map((_, i) => (
                      <Cell key={i} fill='#EB0A1E'/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {grafico === 'tiempos' && (
          <ResponsiveContainer width="100%" height={Math.max(200, tiemposPorTurno.length * 50)}>
            <BarChart data={tiemposPorTurno} layout='vertical' margin={{ left: 20}}>
              <CartesianGrid strokeDasharray="3 3" stroke='#E0E0E0' horizontal={false}/>
              <XAxis type='number' hide/>
              <YAxis dataKey="turno" type='category' tick={{ fontSize: 13, fill: '#595959'}} axisLine={false} tickLine={false} width={110}/>
              <Tooltip formatter={(value) => typeof value === 'number' ? `${value} min` : ''}/>
              <Bar dataKey="minutos" radius={[0, 4, 4, 0]}>
                <LabelList dataKey="minutos" position="right" formatter={(v) => v != null ? `${v} min` : ''} style={{fontSize: 12, fill: '#595959'}}/>
                  {
                    tiemposPorTurno.map((t, i) => (
                      <Cell key={i} fill={t.minutos > promedioEquipo ? '#F59E0B' : '#10B981'}/>
                    ))
                  }
              </Bar>              
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  )
}

export default MiPerfil