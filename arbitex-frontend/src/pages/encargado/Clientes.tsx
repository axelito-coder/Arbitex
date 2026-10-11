import { useEffect, useState } from 'react'
import '../../styles/Clientes.css'

type Cliente = {
  id: number
  nombre: string
  dni: string
  email: string
  telefono: string
  visitas: number
  ultimo_service: string
  total_facturado: number
}

type TurnoCliente = {
  id: number
  fecha: string
  tipo_service: string
  estado: string
  patente: string
  marca: string
  modelo: string
  version: string
  total: number | null
  asesor: string
}

type Detalle = {
  id: number
  nombre: string
  dni: string
  email: string
  telefono: string
  turnos: TurnoCliente[]
}

function getClaseEstado(estado: string) {
  if (estado === 'finalizado') return 'badge badge-verde'
  if (estado === 'en_proceso') return 'badge badge-azul'
  if (estado === 'asignado') return 'badge badge-naranja'
  if (estado === 'pendiente') return 'badge badge-gris-oscuro'
  return 'badge badge-gris'
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
  if (filtro === '6+')  return visitas >= 6
  return true
}

function cumpleService(fechaISO: string, filtro: string) {
  if (!filtro) return true
  const dias = diasDesde(fechaISO)
  if (filtro === 'nunca') return dias === null
  if (dias === null) return false
  if (filtro === '30d') return dias <= 30
  if (filtro === '3m')  return dias <= 90
  if (filtro === '6m')  return dias <= 180
  if (filtro === '+1a') return dias > 365
  return true
}

function Clientes() {

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [visibles, setVisible] = useState(10)

  const [filtroVisitas, setFiltroVisitas] = useState('')
  const [filtroService, setFiltroService] = useState('')
  const [orden, setOrden]                 = useState('visitas')

  //cuando hay un dni seleccionado se muestra el detalle en vez de la lista
  const [dniDetalle, setDniDetalle] = useState<string | null>(null)
  const [detalle, setDetalle] = useState<Detalle | null>(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  useEffect(() => {
    async function cargarClientes() {
      try {
        //traemos el token para hacer las llamadas al back
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3000/encargado/clientes', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (res.ok) {
          setClientes(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    cargarClientes()
  }, [])

  //se dispara cada vez que cambia el dni seleccionado
  useEffect(() => {
    if (!dniDetalle) {
      setDetalle(null)
      return
    }

    async function cargarDetalle() {
      setLoadingDetalle(true)
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`http://localhost:3000/encargado/clientes/${dniDetalle}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (res.ok) {
          setDetalle(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingDetalle(false)
      }
    }
    cargarDetalle()
  }, [dniDetalle])

  if (loading) {
    return <p className='seccion-titulo'>Cargando...</p>
  }

  // ----------------------------------------------------------
  // VISTA DE DETALLE
  // ----------------------------------------------------------
  if (dniDetalle) {

    if (loadingDetalle || !detalle) {
      return <p className='seccion-titulo'>Cargando...</p>
    }

    const totalCliente = detalle.turnos.reduce((acc, t) => acc + Number(t.total || 0), 0)

    return (
      <div className="clientes">

        <div className='cliente-detalle-header'>
          <button className='filtro-limpiar' onClick={() => setDniDetalle(null)}>
            ← Volver
          </button>

          <div>
            <p className='seccion-titulo'>Cliente</p>
            <p className='cliente-nombre'>{detalle.nombre}</p>
          </div>

          <div className='cliente-datos'>
            <div>
              <p className='detalle-label'>DNI</p>
              <p className='asesor-valor'>{detalle.dni}</p>
            </div>
            <div>
              <p className='detalle-label'>Teléfono</p>
              <p className='asesor-valor'>{detalle.telefono || '-'}</p>
            </div>
            <div>
              <p className='detalle-label'>Email</p>
              <p className='asesor-valor'>{detalle.email || '-'}</p>
            </div>
            <div>
              <p className='detalle-label'>Turnos</p>
              <p className='asesor-valor'>{detalle.turnos.length}</p>
            </div>
            <div>
              <p className='detalle-label'>Total facturado</p>
              <p className='asesor-valor'>${totalCliente.toLocaleString('es-AR')}</p>
            </div>
          </div>
        </div>

        <div className="clientes-tabla">
          <p className='seccion-titulo'>Historial de turnos</p>
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Patente</th>
                  <th>Vehículo</th>
                  <th>Service</th>
                  <th>Asesor</th>
                  <th>Estado</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {detalle.turnos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="sin-datos">Este cliente todavía no tiene turnos</td>
                  </tr>
                ) : (
                  detalle.turnos.map((t) => (
                    <tr key={t.id}>
                      <td>{formatearFecha(t.fecha)}</td>
                      <td><span className='patente'>{t.patente}</span></td>
                      <td>{t.marca} {t.modelo}</td>
                      <td>{t.tipo_service}</td>
                      <td>{t.asesor || '-'}</td>
                      <td><span className={getClaseEstado(t.estado)}>{t.estado}</span></td>
                      <td>{t.total ? `$${Number(t.total).toLocaleString('es-AR')}` : '-'}</td>
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

  // ----------------------------------------------------------
  // VISTA DE LISTA
  // ----------------------------------------------------------
  const clientesFiltrados = clientes
    .filter((c) => {
      if (!busqueda) return true
      const texto = busqueda.toLowerCase()
      return (
        c.nombre?.toLowerCase().includes(texto) ||
        c.dni?.toLowerCase().includes(texto)
      )
    })
    .filter((c) => cumpleVisitas(Number(c.visitas), filtroVisitas))
    .filter((c) => cumpleService(c.ultimo_service, filtroService))
    .sort((a, b) => {
      if (orden === 'nombre')    return a.nombre.localeCompare(b.nombre, 'es')
      if (orden === 'facturado') return Number(b.total_facturado) - Number(a.total_facturado)
      if (orden === 'service') {
        const fa = a.ultimo_service ? new Date(a.ultimo_service).getTime() : 0
        const fb = b.ultimo_service ? new Date(b.ultimo_service).getTime() : 0
        return fb - fa
      }
      return Number(b.visitas) - Number(a.visitas)
    })

  const clientesPaginados = clientesFiltrados.slice(0, visibles)

  function limpiarFiltros() {
    setBusqueda('')
    setFiltroVisitas('')
    setFiltroService('')
    setOrden('visitas')
    setVisible(10)
  }

  return (
    <div className="clientes">

      {/* FILTROS */}
      <div className="clientes-filtros">
        <div className="filtro-campo">
          <label className="filtro-label">Buscar</label>
          <input
            className="filtro-select"
            placeholder='Nombre o DNI'
            value={busqueda}
            onChange={(e) => {setBusqueda(e.target.value); setVisible(10)}}
          />
        </div>

        <div className="filtro-campo">
          <label className="filtro-label">Visitas</label>
          <select
            className="filtro-select"
            value={filtroVisitas}
            onChange={(e) => {setFiltroVisitas(e.target.value); setVisible(10)}}
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
            onChange={(e) => {setFiltroService(e.target.value); setVisible(10)}}
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
            onChange={(e) => {setOrden(e.target.value); setVisible(10)}}
          >
            <option value="visitas">Visitas</option>
            <option value="facturado">Total facturado</option>
            <option value="service">Último service</option>
            <option value="nombre">Nombre (A-Z)</option>
          </select>
        </div>

        <button className="filtro-limpiar" onClick={limpiarFiltros}>
          Limpiar
        </button>
      </div>

      {/* TABLA */}
      <div className="clientes-tabla">
        <p className='seccion-titulo'>Clientes ({clientesFiltrados.length})</p>
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Visitas</th>
                <th>Último service</th>
                <th>Total facturado</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="sin-datos">No hay clientes para mostrar</td>
                </tr>
              ) : (
                clientesPaginados.map((c) => (
                  <tr key={c.id} onClick={() => setDniDetalle(c.dni)} style={{ cursor: 'pointer' }}>
                    <td>{c.nombre}</td>
                    <td>{c.dni}</td>
                    <td>{c.email || '-'}</td>
                    <td>{c.telefono || '-'}</td>
                    <td>{Number(c.visitas)}</td>
                    <td>{formatearFecha(c.ultimo_service)}</td>
                    <td>${Number(c.total_facturado).toLocaleString('es-AR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {visibles < clientesFiltrados.length && (
            <div className='ver-mas-contenedor'>
              <button className='btn-ver-mas' onClick={() => setVisible(prev => prev + 10)}>
                ver más ({clientesFiltrados.length - visibles} restantes)
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default Clientes