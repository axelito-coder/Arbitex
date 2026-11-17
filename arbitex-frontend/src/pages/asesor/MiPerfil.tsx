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
  const [grafico, setGrafico] = useState<'acumulado' | 'tiempos'>('acumulado') //Se usa para mostrar alguno de los gráficos
  const [loading, setLoading] = useState(true)
  const [esMobile, setEsMobile] = useState(window.innerWidth < 768)

  //para diferenciar si es mobile 
  useEffect(() => {
    const handler = () => setEsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

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

  //para que la fecha se vea bien
  function formatearFechaTooltip(v: unknown) {
  const fecha = new Date(v as string)
  return fecha.toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
    timeZone: 'America/Argentina/Buenos_Aires'
  })
}
  
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

      {/* GRAFICOS */} {/* Segun el boton que se presiona se cambia el estado de gráfico para mostrar el indicado */}
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
                 {/* BarChart: el gráfico en sí. margin agrega espacio abajo para las etiquetas del eje X */}
                <BarChart data={perfil.acumulado_por_dia} margin={{bottom: esMobile ? 0 : 20}}>
                  
                  {/* CartesianGrid: las líneas de fondo. vertical={false} muestra solo las horizontales */}
                  <CartesianGrid strokeDasharray="3 3" stroke='#E0E0E0' vertical={false}/>

                   {/* XAxis: eje con los días. hide lo oculta en mobile. tickFormatter transforma la fecha ISO a texto legible */}
                  <XAxis dataKey="fecha" hide={esMobile} tick={{fontSize: 12, fill: 'var(--texto-suave)'}} axisLine={false} tickLine={false}
                  tickFormatter={(v) => {
                    const fecha = new Date(v)
                    return fecha.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', timeZone: 'America/Argentina/Buenos_Aires'})
                  }}/>

                  {/* YAxis: eje de los valores en $. Se oculta porque los valores se muestran con LabelList */}
                  <YAxis hide/>

                  {/* Tooltip: el cuadro al pasar el mouse. labelFormatter formatea la fecha, formatter agrega el $ al valor */}
                  <Tooltip contentStyle={{ background: 'var(--superficie)', border: '1px solid var(--borde)', borderRadius: 8, fontSize: 12 }} itemStyle={{color: 'var(--texto-suave)'}} labelFormatter={formatearFechaTooltip} formatter={(value) => [`$${Number(value).toLocaleString('es-AR')}`, 'Acumulado']}/>
                  
                   {/* Bar: las barras del gráfico */}
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    
                    {/* LabelList: muestra el valor en $ encima de cada barra */}
                    <LabelList dataKey="total" position="top" formatter={(v: unknown) => typeof v === 'number' ? `$${v.toLocaleString('es-AR')}` : ''} style={{ fontSize: 11, fill: '#595959'}}/>
                    
                    {/* Cell: aplica el color rojo a cada barra */}
                    {perfil.acumulado_por_dia.map((_, i) => (
                      <Cell key={i} fill='#EB0A1E'/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {grafico === 'tiempos' && !esMobile && (
          <ResponsiveContainer width="100%" height={Math.max(200, tiemposPorTurno.length * 50)}>

            <BarChart data={tiemposPorTurno} layout='vertical' margin={{ left: 20}}>
              
              <CartesianGrid strokeDasharray="3 3" stroke='#E0E0E0' horizontal={false}/>
              <XAxis type='number' hide/>
              <YAxis dataKey="turno" type='category' tick={{ fontSize: 13, fill: 'var(--texto-suave)'}} axisLine={false} tickLine={false} width={110}/>
             
             <Tooltip 
               contentStyle={{ background: 'var(--superficie)', border: '1px solid var(--borde)', borderRadius: 8, fontSize: 12, color: 'var(--texto)' }}
               itemStyle={{ color: 'var(--texto)' }}
               formatter={(value) => [`${value} min`, 'Tiempo']}/>
             <Bar dataKey="minutos" radius={[0, 4, 4, 0]}>
                <LabelList dataKey="minutos" position="center" formatter={(v) => v != null ? `${v} min` : ''} style={{fontSize: 15, fill: 'black'}}/>
                  {
                    tiemposPorTurno.map((t, i) => (
                      <Cell key={i} fill={t.minutos > promedioEquipo ? '#F59E0B' : '#10B981'}/>
                    ))
                  }
              </Bar>              
            </BarChart>
          </ResponsiveContainer>
        )}
        {
          grafico === 'tiempos' && esMobile &&(
            <p style={{fontSize: 13, color: '#595959', textAlign: 'center', padding: 32}}>
              El gráfico de tiempos de turnos esta habilitado solamente en escritorio y tablet
            </p>
          )
        }
      </div>

    </div>
  )
}

export default MiPerfil