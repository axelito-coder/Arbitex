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

function Clientes() {

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

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
  const clientesFiltrados = clientes.filter((c) => {
    if (!busqueda) return true
    const texto = busqueda.toLowerCase()
    return (
      c.nombre?.toLowerCase().includes(texto) ||
      c.dni?.toLowerCase().includes(texto)
    )
  })

  return (
    <div className="clientes">

      {/* BUSCADOR */}
      <div className="clientes-filtros">
        <div className="filtro-campo">
          <label className="filtro-label">Buscar</label>
          <input
            className="filtro-select"
            placeholder='Nombre o DNI'
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <button className="filtro-limpiar" onClick={() => setBusqueda('')}>
          Limpiar
        </button>
      </div>

      {/* TABLA */}
      <div className="clientes-tabla">
        <p className='seccion-titulo'>Clientes</p>
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
                clientesFiltrados.map((c) => (
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
        </div>
      </div>

    </div>
  )
}

export default Clientes