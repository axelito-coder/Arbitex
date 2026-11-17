import { useEffect, useState } from 'react'
import '../../styles/Clientes.css'
import ClienteDetalle from '../../components/ClienteDetalle'

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

//cuantos dias pasaron desde una fecha, null si nunca vino
function diasDesde(fechaISO: string) {
  if (!fechaISO) return null
  const ms = Date.now() - new Date(fechaISO).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
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

    
  if (loading) {
    return <p className='seccion-titulo'>Cargando...</p>
  }

  if(dniDetalle){
    return(
      <ClienteDetalle dni ={dniDetalle} onVolver={() => setDniDetalle(null)}/>
    )
  }

  // VISTA DE LISTA
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