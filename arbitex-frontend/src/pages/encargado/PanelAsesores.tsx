import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import '../../styles/PanelAsesores.css'

type Asesor = {
  nombre: string,
  id_usuario: number,
  acumulado_semanal: number
  acumulado_distribucion: number,
  sesion_activa: boolean
  tiempo_promedio: number
  orden_compensacion: number
  comision: number
  turnos_hoy: number
  en_proceso: number
}

function PanelAsesores() {
  
  const [ asesores, setAsesores] = useState<Asesor[]>([])
  const [ loading, setLoading] = useState(true)
  const [bonusAsesor, setBonusAsesor] = useState<number | null>(null)
  const [montoBonusInput, setMontoBonusInput] = useState('')
  const [mensajeBonus, setMensajeBonus] = useState('')
  async function  cargarAsesores() {
      try{
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3000/encargado/asesores', {
          headers: { Authorization: `Bearer ${token}`}
        })
        const data = await res.json()
        if(res.ok){
          setAsesores(data)
        }
      }catch(err){
        console.error(err)
      }finally{
        setLoading(false)
      }
    }
  useEffect(() => {
    setLoading(false)
    cargarAsesores()
  }, [])

  //Calcular métricas del equipo
  const mejorAcumulado = Math.max(...asesores.map(a => Number(a.acumulado_semanal)))
  const mejorTiempo = Math.min(...asesores.filter(a => Number(a.tiempo_promedio) > 0).map(a => Number(a.tiempo_promedio)))
  
  if(loading){
    return <p className='seccion-titulo'>Cargando...</p>
  }
  const promedioEquipo = 20
  const datosGrafico = asesores.map(a => ({
    nombre: a.nombre,
    acumulado: Number(a.acumulado_semanal),
    distribucion: Number(a.acumulado_distribucion)
  }))

  async function  handleDarBonus(idUsuario: number) {
    if(!montoBonusInput || Number(montoBonusInput) <= 0) return
    try{
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3000/encargado/asesores/${idUsuario}/bonus`, {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({monto: Number(montoBonusInput)})
      })
      const data = await res.json()
      setMensajeBonus(data.mensaje)
      setBonusAsesor(null)
      setMontoBonusInput('')
      cargarAsesores()
    }catch{
      setMensajeBonus('Error al conectar al servidor')
    }
  }
  
  return (
    <div className="panel">

      {/* TARJETAS DE ASESORES */}
      <div className="panel-tarjetas">
        {asesores.map((asesor, i) => {
          const superaPromedio = asesor.tiempo_promedio > promedioEquipo
          const ocupado = asesor.en_proceso > 0
          const tieneFicticio = Number(asesor.acumulado_distribucion) > Number(asesor.acumulado_semanal)

          return (
            <div key={i} className="asesor-card">
              <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8}}>
                {Number(asesor.acumulado_semanal) === mejorAcumulado && mejorAcumulado > 0 &&(
                  <span className='alerta-badge-monto'>
                    🏆 Mejor facturación
                  </span>
                )}

                {Number(asesor.tiempo_promedio) === mejorTiempo && mejorTiempo > 0 &&(
                  <span className='alerta-badge-tiempo'>
                    ⚡ Mejor Tiempo
                  </span>
                )}
                {tieneFicticio && (
                  <span className='alerta-badge-ficticio'>
                       ⚠ Ausencia esta semana
                   </span>
                )}
              </div>
              <div className="asesor-header">
                <div className="asesor-avatar">{asesor.nombre.charAt(0)}</div>
                <div>
                  <p className="asesor-nombre">{asesor.nombre}</p>
                  <span className={`badge-estado ${ocupado ? 'ocupado' : 'disponible'}`}>
                    {ocupado ? 'Ocupado' : 'Disponible'}
                  </span>
                </div>
              </div>

              <div className="asesor-info">
                <p className="asesor-label">Turno actual</p>
                <p className="asesor-valor">
                  {asesor.turnos_hoy}
                </p>
              </div>

              <div className="asesor-info">
                <p className="asesor-label">Acumulado semanal</p>
                <p className="asesor-valor">${Number(asesor.acumulado_semanal).toLocaleString('es-AR')}</p>
              </div>

              <div className="asesor-info">
                <p className='asesor-label'>Comisión</p>
                <p className='asesor-valor'>${Number(asesor.comision).toLocaleString('es-AR')}</p>
              </div>

              <div className="asesor-info">
                <p className="asesor-label">Tiempo promedio</p>
                <p className={`asesor-valor ${superaPromedio ? 'alerta' : ''}`}>
                  {Math.round(Number(asesor.tiempo_promedio))} min
                  {superaPromedio && <span className="asesor-alerta"> ⚠ Supera el promedio</span>}
                </p>
              </div>

              <div className='asesor-info'>
                <p className='asesor-label'>Bonus</p>
                {mensajeBonus && <p className='asesorLabel'>{mensajeBonus}</p>}

                {
                  bonusAsesor === asesor.id_usuario ? (
                    <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                      <input type="number" className='item-input' placeholder='Monto' value={montoBonusInput} onChange={(e) => setMontoBonusInput(e.target.value)}  style={{width: 120}}/>
                      <button className='gestion-btn-guardar' onClick={() => handleDarBonus(asesor.id_usuario)}>Dar</button>
                      <button className='gestion-btn-guardar' onClick={() => setBonusAsesor(null)}>✕</button>
                    </div>
                  ) : (
                     <button className='gestion-btn-editar' onClick={() => setBonusAsesor(asesor.id_usuario)}>+ Bonus</button>
                  )
                }
              </div>
            </div>
          )
        })}
      </div>

      {/* GRÁFICO COMPARATIVO */}
      <div className='panel-grafico'>
         <div style={{display: 'flex', gap: 16, marginBottom: 12, fontSize: 12, color: '#595959'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                <div style={{width: 12, height: 12, borderRadius: 2, background: '#EB0A1E'}}></div>
                <span>Facturado real</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                <div style={{width: 12, height: 12, borderRadius: 2, background: '#E0E0E0'}}></div>
                <span>Posicion de distribucion (incluye ajuste por ausencia)</span>
              </div>
            </div>
        <p className='seccion-titulo'>Acumulado semanal por asesor</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={datosGrafico}>
            <CartesianGrid strokeDasharray="3 3" stroke='#E0E0E0' vertical={false}/>
            <XAxis dataKey="nombre" tick={{ fontSize: 13, fill: '#595959'}} axisLine={false} tickLine={false}/>
            <YAxis hide/>
            <Tooltip formatter={(value, name) => {
                          const num = Number(value) 
                          return [`$${isNaN(num) ? '-' : num.toLocaleString('es-AR')}`, String(name)]}
            }/>
            <Bar dataKey="acumulado" name="Facturado real" radius={[4, 4, 0, 0]}>
              {datosGrafico.map((_, i) => (
                <Cell key={i} fill="#EB0A1E"/>
              ))}
            </Bar>
            <Bar dataKey="distribucion" name="acumulado distribucion" radius={[4, 4, 0, 0]}>
              {datosGrafico.map((_, i) => (
                <Cell key={i} fill="#E0E0E0"/>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}

export default PanelAsesores