import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import '../../styles/VehiculosFrecuentes.css'

type Vehiculo = {
  patente: string
  marca: string
  modelo: string
  version: string
  cliente: string
  telefono: string
  email: string
  visitas: number
  ultimo_service: string
  total_facturado: number
}

function formatearFecha(fechaISO: string) { //para que la fecha se vea bien
  if (!fechaISO) return '-'
  const fecha = new Date(fechaISO)
  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

//cuantos dias pasaron desde una fecha, null si nunca vino
function diasDesde(fechaISO: string) {
  if (!fechaISO) return null
  const ms = Date.now() - new Date(fechaISO).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

function cumpleVisitas(visitas: number, filtro: string) {
  if (!filtro) return true
  if (filtro === 'sin') return visitas === 0
  if (filtro === '1-2') return visitas >= 1 && visitas <= 2
  if (filtro === '3-5') return visitas >= 3 && visitas <= 5
  if (filtro === '6+') return visitas >= 6
  return true
}

function cumpleService(fechaISO: string, filtro: string) {
  if (!filtro) return true
  const dias = diasDesde(fechaISO)
  if (filtro === 'nunca') return dias === null
  if (dias === null) return false
  if (filtro === '30d') return dias <= 30
  if (filtro === '3m') return dias <= 90
  if (filtro === '6m') return dias <= 180
  if (filtro === '+1a') return dias > 365
  return true
}

function VehiculosFrecuentes() {

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [visibles, setVisibles] = useState(10)
  const [graficoActivo, setGraficoActivo] = useState<'visitas' | 'facturado'>('visitas') //para cambiar el gráfico

  const [filtroMarca, setFiltroMarca] = useState('')
  const [filtroModelo, setFiltroModelo] = useState('')
  const [filtroVisitas, setFiltroVisitas] = useState('')
  const [filtroService, setFiltroService] = useState('')
  const [orden, setOrden] = useState('visitas')
  const [esMobile, setEsMobile] = useState(window.innerWidth < 768)

  //para diferenciar si es mobile 
  useEffect(() => {
    const handler = () => setEsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    async function cargarVehiculos() {
      try {
        //traemos el token para hacer las llamadas al back
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3000/encargado/vehiculos/frecuentes', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (res.ok) {
          setVehiculos(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    cargarVehiculos()
  }, [])

  if (loading) {
    return <p className='seccion-titulo'>Cargando...</p>
  }

  //las opciones de marca salen de los propios datos
  const marcas = [...new Set(vehiculos.map(v => v.marca).filter(Boolean))].sort()

  //los modelos dependen de la marca elegida
  const modelos = [...new Set(
    vehiculos
      .filter(v => !filtroMarca || v.marca === filtroMarca)
      .map(v => v.modelo)
      .filter(Boolean)
  )].sort()

  //filtro por patente, cliente, marca o modelo
  const vehiculosFiltrados = vehiculos
    .filter((v) => {
      if (!busqueda) return true
      const texto = busqueda.toLowerCase()
      return (
        v.patente?.toLowerCase().includes(texto) ||
        v.cliente?.toLowerCase().includes(texto) ||
        `${v.marca} ${v.modelo}`.toLowerCase().includes(texto)
      )
    })
    .filter((v) => !filtroMarca || v.marca === filtroMarca)
    .filter((v) => !filtroModelo || v.modelo === filtroModelo)
    .filter((v) => cumpleVisitas(Number(v.visitas), filtroVisitas))
    .filter((v) => cumpleService(v.ultimo_service, filtroService))
    .sort((a, b) => {
      if (orden === 'patente') return a.patente.localeCompare(b.patente, 'es')
      if (orden === 'facturado') return Number(b.total_facturado) - Number(a.total_facturado)
      if (orden === 'service') {
        const fa = a.ultimo_service ? new Date(a.ultimo_service).getTime() : 0
        const fb = b.ultimo_service ? new Date(b.ultimo_service).getTime() : 0
        return fb - fa
      }
      return Number(b.visitas) - Number(a.visitas)
    })

  const vehiculosPaginados = vehiculosFiltrados.slice(0, visibles)
  //agrupamos las visitas por marca + modelo para el gráfico
  const porModelo = vehiculosFiltrados.reduce((acc: Record<string, number>, v) => {
    const key = `${v.marca} ${v.modelo}`
    acc[key] = (acc[key] || 0) + Number(v.visitas)
    return acc
  }, {})

  const datosGrafico = Object.entries(porModelo)
    .map(([nombre, visitas]) => ({ nombre, visitas }))
    .sort((a, b) => b.visitas - a.visitas)
    .slice(0, 5)

  const datosGraficoFacturado = Object.entries(
    vehiculosFiltrados.reduce((acc: Record<string, number>, v) => {
      const key = `${v.marca} ${v.modelo}`
      acc[key] = (acc[key] || 0) + Number(v.total_facturado)
      return acc
    }, {})
  )
    .map(([nombre, facturado]) => ({ nombre, facturado }))
    .sort((a, b) => b.facturado - a.facturado)
    .slice(0, 5)

  //métricas de arriba
  const totalVisitas = vehiculosFiltrados.reduce((acc, v) => acc + Number(v.visitas), 0)
  const totalFacturado = vehiculosFiltrados.reduce((acc, v) => acc + Number(v.total_facturado), 0)

  function limpiarFiltros() {
    setBusqueda('')
    setFiltroMarca('')
    setFiltroModelo('')
    setFiltroVisitas('')
    setFiltroService('')
    setOrden('visitas')
    setVisibles(10)
  }

  return (
    <div className="vehiculos">

      {/* RESUMEN */}
      <div className='vehiculos-resumen'>

        <p className='seccion-titulo'>Vehículos frecuentes</p>

        <div className='resumen-datos'>
          <div>
            <p className='detalle-label'>Vehículos registrados</p>
            <p className='asesor-valor'>{vehiculosFiltrados.length}</p>
          </div>

          <div>
            <p className='detalle-label'>Visitas totales</p>
            <p className='asesor-valor'>{totalVisitas}</p>
          </div>

          <div>
            <p className='detalle-label'>Total facturado</p>
            <p className='asesor-valor'>${totalFacturado.toLocaleString('es-AR')}</p>
          </div>
        </div>

      </div>

      {/* FILTROS */}
      <div className="vehiculos-filtros">
        <div className="filtro-campo">
          <label className="filtro-label">Buscar</label>
          <input
            className="filtro-select"
            placeholder='Patente, cliente o modelo'
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setVisibles(10) }}
          />
        </div>

        <div className="filtro-campo">
          <label className="filtro-label">Marca</label>
          <select
            className="filtro-select"
            value={filtroMarca}
            onChange={(e) => { setFiltroMarca(e.target.value); setFiltroModelo(''); setVisibles(10) }}
          >
            <option value="">Todas las marcas</option>
            {marcas.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div className="filtro-campo">
          <label className="filtro-label">Modelo</label>
          <select
            className="filtro-select"
            value={filtroModelo}
            onChange={(e) => { setFiltroModelo(e.target.value); setVisibles(10) }}
          >
            <option value="">Todos los modelos</option>
            {modelos.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div className="filtro-campo">
          <label className="filtro-label">Visitas</label>
          <select
            className="filtro-select"
            value={filtroVisitas}
            onChange={(e) => { setFiltroVisitas(e.target.value); setVisibles(10) }}
          >
            <option value="">Todas</option>
            <option value="sin">Sin visitas</option>
            <option value="1-2">1 a 2</option>
            <option value="3-5">3 a 5</option>
            <option value="6+">6 o más</option>
          </select>
        </div>

        <div className="filtro-campo">
          <label className="filtro-label">Último service</label>
          <select
            className="filtro-select"
            value={filtroService}
            onChange={(e) => { setFiltroService(e.target.value); setVisibles(10) }}
          >
            <option value="">Todos</option>
            <option value="30d">Últimos 30 días</option>
            <option value="3m">Últimos 3 meses</option>
            <option value="6m">Últimos 6 meses</option>
            <option value="+1a">Hace más de un año</option>
            <option value="nunca">Nunca vino</option>
          </select>
        </div>

        <div className="filtro-campo">
          <label className="filtro-label">Ordenar por</label>
          <select
            className="filtro-select"
            value={orden}
            onChange={(e) => { setOrden(e.target.value); setVisibles(10) }}
          >
            <option value="visitas">Visitas</option>
            <option value="facturado">Total facturado</option>
            <option value="service">Último service</option>
            <option value="patente">Patente (A-Z)</option>
          </select>
        </div>

        <button className="filtro-limpiar" onClick={limpiarFiltros}>
          Limpiar
        </button>
      </div>

      {/* TABLA */}
      <div className="vehiculos-tabla">
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Patente</th>
                <th>Vehículo</th>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Visitas</th>
                <th>Último service</th>
                <th>Total facturado</th>
              </tr>
            </thead>
            <tbody>
              {vehiculosPaginados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="sin-datos">No hay vehículos para mostrar</td>
                </tr>
              ) : (
                vehiculosPaginados.map((v) => (
                  <tr key={v.patente}>
                    <td><span className='patente'>{v.patente}</span></td>
                    <td>{v.marca} {v.modelo}</td>
                    <td>{v.cliente}</td>
                    <td>{v.telefono || '-'}</td>
                    <td>{Number(v.visitas)}</td>
                    <td>{formatearFecha(v.ultimo_service)}</td>
                    <td>${Number(v.total_facturado).toLocaleString('es-AR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {visibles < vehiculosFiltrados.length && (
            <div className='ver-mas-contenedor'>
              <button className='btn-ver-mas' onClick={() => setVisibles(prev => prev + 10)}>
                ver más ({vehiculosFiltrados.length - visibles} restantes)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* GRÁFICO */}
      <div className='vehiculos-grafico'>
        <div className='grafico-botones'>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              className={`btn-grafico ${graficoActivo === 'visitas' ? 'activo' : ''}`}
              onClick={() => setGraficoActivo('visitas')}
            >
              Visitas
            </button>
            <button
              className={`btn-grafico ${graficoActivo === 'facturado' ? 'activo' : ''}`}
              onClick={() => setGraficoActivo('facturado')}
            >
              Facturado
            </button>
          </div>
        </div>
        <p className='seccion-titulo'>
          {graficoActivo === 'visitas' ? 'Modelos más frecuentes' : 'Modelos que más generan'}
        </p>

        {graficoActivo === 'visitas' ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={datosGrafico} margin={{ bottom: esMobile ? 0 : 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke='#E0E0E0' vertical={false} />
              <XAxis dataKey="nombre" hide={esMobile} tick={{ fontSize: 11, fill: '#595959' }} axisLine={false} tickLine={false} interval={0} />
              <YAxis hide />
              <Tooltip labelFormatter={(label) => `${label}`} formatter={(value) => [`${value} visitas`, 'Visitas']} />
              <Bar dataKey="visitas" name="Visitas" radius={[4, 4, 0, 0]}>
                {datosGrafico.map((_, i) => <Cell key={i} fill="#EB0A1E" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={datosGraficoFacturado} margin={{ bottom: esMobile ? 0 : 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke='#E0E0E0' vertical={false} />
              <XAxis dataKey="nombre" hide={esMobile} tick={{ fontSize: 11, fill: '#595959' }} axisLine={false} tickLine={false} interval={0} />
              <YAxis hide />
              <Tooltip labelFormatter={(label) => `${label}`} formatter={(value) => [`$${Number(value).toLocaleString('es-AR')}`, 'Facturado']} />
              <Bar dataKey="facturado" name="Facturado" radius={[4, 4, 0, 0]}>
                {datosGraficoFacturado.map((_, i) => <Cell key={i} fill="#EB0A1E" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  )
}

export default VehiculosFrecuentes