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

function VehiculosFrecuentes() {

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [visibles, setVisibles] = useState(10)

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

  //filtro por patente, cliente, marca o modelo
  const vehiculosFiltrados = vehiculos.filter((v) => {
    if (!busqueda) return true
    const texto = busqueda.toLowerCase()
    return (
      v.patente?.toLowerCase().includes(texto) ||
      v.cliente?.toLowerCase().includes(texto) ||
      `${v.marca} ${v.modelo}`.toLowerCase().includes(texto)
    )
  })

  const vehiculosPaginados = vehiculosFiltrados.slice(0, visibles)
  //agrupamos las visitas por marca + modelo para el gráfico
  const porModelo = vehiculos.reduce((acc: Record<string, number>, v) => {
    const key = `${v.marca} ${v.modelo}`
    acc[key] = (acc[key] || 0) + Number(v.visitas)
    return acc
  }, {})

  const datosGrafico = Object.entries(porModelo)
    .map(([nombre, visitas]) => ({ nombre, visitas }))
    .sort((a, b) => b.visitas - a.visitas)
    .slice(0, 10)

  //métricas de arriba
  const totalVisitas = vehiculos.reduce((acc, v) => acc + Number(v.visitas), 0)
  const totalFacturado = vehiculos.reduce((acc, v) => acc + Number(v.total_facturado), 0)

  return (
    <div className="vehiculos">

      {/* RESUMEN */}
      <div className='vehiculos-resumen'>

        <p className='seccion-titulo'>Vehículos frecuentes</p>

        <div className='resumen-datos'>
          <div>
            <p className='detalle-label'>Vehículos registrados</p>
            <p className='asesor-valor'>{vehiculos.length}</p>
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

      {/* BUSCADOR */}
      <div className="vehiculos-filtros">
        <div className="filtro-campo">
          <label className="filtro-label">Buscar</label>
          <input
            className="filtro-select"
            placeholder='Patente, cliente o modelo'
            value={busqueda}
            onChange={(e) => {setBusqueda(e.target.value); setVisibles(10)}}
          />
        </div>

        <button className="filtro-limpiar" onClick={() => setBusqueda('')}>
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
        <p className='seccion-titulo'>Modelos más frecuentes</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={datosGrafico}>
            <CartesianGrid strokeDasharray="3 3" stroke='#E0E0E0' vertical={false} />
            <XAxis dataKey="nombre" tick={{ fontSize: 12, fill: '#595959' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={(value) => [`${value} visitas`, 'Visitas']} />
            <Bar dataKey="visitas" name="Visitas" radius={[4, 4, 0, 0]}>
              {datosGrafico.map((_, i) => (
                <Cell key={i} fill="#EB0A1E" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}

export default VehiculosFrecuentes