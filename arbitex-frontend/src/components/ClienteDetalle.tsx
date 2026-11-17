import { useEffect, useState } from 'react'
import '../styles/Clientes.css'
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

type Props = {
    dni: string
    onVolver: () => void
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

function ClienteDetalle({ dni, onVolver }: Props) {
    //cuando hay un dni seleccionado se muestra el detalle en vez de la lista
    const [detalle, setDetalle] = useState<Detalle | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function cargarDetalle() {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`http://localhost:3000/encargado/clientes/${dni}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const data = await res.json()
                if (res.ok) setDetalle(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        cargarDetalle()
    }, [dni])



    if (loading || !detalle) return <p className='seccion-titulo'>Cargando...</p>

    const totalCliente = detalle.turnos.reduce((acc, t) => acc + Number(t.total || 0), 0)

    // VISTA DE DETALLE de los clientes
    return (
        <div className="clientes">

            <div className='cliente-detalle-header'>
                <button className='filtro-limpiar' onClick={onVolver}>
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


export default ClienteDetalle