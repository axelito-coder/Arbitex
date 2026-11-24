import { useEffect, useState } from 'react'
import AgregarItems from '../pages/asesor/AgregarItems'
import '../styles/DetalleTurno.css'


//En typescript cuando hacemos type ... definimos como debe ser un objeto
//Cuando typescript compila el codigo a javascript, los types no existen mas, solo sirven para detectar errores y hacer las coas mas limpias
type Item = {
    id: number,
    descripcion: string,
    cantidad: number,
    precio_unitario: number,
    tipo: String
}


//para trabajar con todo el turno
type Detalle = {
    id: number,
    fecha: string,
    hora_carga: string,
    tipo_service: string
    estado: string,
    cliente: string,
    email: string | null,
    telefono: string | null,
    marca: string,
    modelo: string,
    version: string,
    nro_serie: string,
    km: number,
    patente: string | null,
    asesor: string,
    nro_factura: string
    total: number,
    duracion_minutos: number | null
    items: Item[]
}


type Props = {
    idTurno: number,
    onVolver: () => void
    urlBase: string //la url porque asesor y encargado tienen en sus respectivos rutas y controladores una funcion para traer todo el turno
}
function formatearFecha(fechaISO: string) {
    const fecha = new Date(fechaISO)
    return fecha.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

function DetalleTurno({ idTurno, onVolver, urlBase }: Props) {
    const [detalle, setDetalle] = useState<Detalle | null>(null)
    const [agregando, setAgregando] = useState(false)
    const [exito, setExito] = useState('')
    const [editandoId, setEditandoId] = useState<number | null>(null)
    const [editCantidad, setEditCantidad] = useState('')
    const [editPrecio, setEditPrecio] = useState('')
    const [confirmandoEliminarId, setConfirmandoEliminarId] = useState<number | null>(null)
    async function cargarDetalle() {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${urlBase}/turnos/${idTurno}/detalle`, {  //traemos el turno
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) setDetalle(data)
        } catch (err) {
            console.error(err)
        }
    }
    useEffect(() => {
        cargarDetalle()
    }, [idTurno])

    if (!detalle) {
        return <p className='seccion-titulo'>Error al caregar el turno...</p>
    }

    async function guardarEdicion(itemId: number) {
        const token = localStorage.getItem('token')
        const res = await fetch(`${urlBase}/turnos/${idTurno}/items/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ cantidad: parseFloat(editCantidad), precio_unitario: parseFloat(editPrecio) })
        })
        if (res.ok) {
            setEditandoId(null)
            setExito('Item actualizado')
            cargarDetalle()
        }
    }

    async function eliminarItemFn(itemId: number) {
        const token = localStorage.getItem('token')
        const res = await fetch(`${urlBase}/turnos/${idTurno}/items/${itemId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
            setConfirmandoEliminarId(null)
            setExito('Item eliminado')
            cargarDetalle()
        }
    }

    function imprimirPDF() {
        window.print()
    }

    return (
        <div className='detalle'>
            <div className='detalle-header'>
                <button className='detalle-volver' onClick={onVolver}>Volver</button>
                <button className='detalle-pdf' onClick={imprimirPDF}>Descargar PDF</button>
            </div>

            <div className='detalle-card' id='detalle-imprimible'>
                <div className='detalle-titulo'>
                    <p className='detalle-nombre'>Arbitex</p>
                    <p className='detalle-subtitulo'>Orden de service #{detalle.id}</p>
                    {detalle.nro_factura && <p className='detalle-factura'>Factura {detalle.nro_factura}</p>}
                    {detalle.fecha && <p className='detalle-factura'>{formatearFecha(detalle.fecha)}</p>}
                </div>

                <div className='detalle-seccion'>
                    <p className='detalle-label'>Cliente</p>
                    <p className='detalle-valor'>{detalle.cliente}</p>
                    {detalle.email && <p className='detalle-sub'>Email: {detalle.email}</p>}
                    {detalle.telefono && <p className='detalle-sub'>Tel: {detalle.telefono}</p>}
                </div>

                <div className='detalle-seccion'>
                    <p className='detalle-label'>Vehiculo</p>
                    <p className='detalle-valor'>{detalle.marca} {detalle.modelo} {detalle.patente}</p>
                    {detalle.version && <p className='detalle-sub'>Version: {detalle.version}</p>}
                    {detalle.nro_serie && <p className='detalle-sub'>nro_serie: {detalle.nro_serie}</p>}
                    {detalle.km && <p className='detalle-sub'>KM: {detalle.km.toLocaleString('es-AR')}</p>}
                </div>


                <div className='detalle-seccion'>
                    <p className='detalle-label'>Service</p>
                    <p className='detalle-valor'>{detalle.tipo_service}</p>
                    <p className='detalle-sub'>{detalle.asesor}</p>
                    {detalle.duracion_minutos && <p className='detalle-sub'>Duracion: {Math.round(detalle.duracion_minutos)} min</p>}
                    {detalle.telefono && <p className='detalle-sub'>Tel: {detalle.telefono}</p>}
                </div>

                {detalle.items && detalle.items.length > 0 && (
                    <div className='detalle-seccion'>
                        <p className='detalle-label'>Items</p>

                        {/* Mobile */}
                        <div className='items-cards'>
                            {detalle.items.map((item, i) => (
                                <div key={i} className='item-card'>
                                    <p className='item-card-descripcion'>{item.descripcion}</p>
                                    <div className='item-card-fila'>
                                        <span className='item-card-label'>Tipo</span>
                                        <span>{item.tipo === 'mano_obra' ? 'Mano de obra' : 'Repuesto'}</span>
                                    </div>
                                    <div className='item-card-fila'>
                                        <span className='item-card-label'>Cantidad</span>
                                        <span>{item.cantidad}</span>
                                    </div>
                                    <div className='item-card-fila'>
                                        <span className='item-card-label'>Precio unitario</span>
                                        <span>${Number(item.precio_unitario).toLocaleString('es-AR')}</span>
                                    </div>
                                    <div className='item-card-fila'>
                                        <span className='item-card-label'>Subtotal</span>
                                        <span>${(item.cantidad * item.precio_unitario).toLocaleString('es-AR')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop */}
                        <table className='tabla items-tabla'>
                            <thead>
                                <tr>
                                    <th>Descripcion</th>
                                    <th>Tipo</th>
                                    <th>Cant</th>
                                    <th>Precio unitario</th>
                                    <th>Subtotal</th>
                                    {detalle.estado === 'finalizado' && urlBase.includes('asesor') && <th>Acciones</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {detalle.items.map((item, i) => (
                                    <tr key={i}>
                                        <td>{item.descripcion}</td>
                                        <td>{item.tipo === 'mano_obra' ? 'Mano de obra' : 'Repuesto'}</td>
                                        <td>
                                            {editandoId === item.id && detalle.estado === 'finalizado' && urlBase.includes('asesor')
                                                ? item.tipo === 'mano_obra'
                                                    ? Math.round(item.cantidad)
                                                    : <input className="item-input-edicion" type="number" value={editCantidad} onChange={e => setEditCantidad(e.target.value)} />
                                                : Math.round(item.cantidad)
                                            }
                                        </td>
                                        <td>
                                            {editandoId === item.id && detalle.estado === 'finalizado' && urlBase.includes('asesor')
                                                ? <input className='item-input-edicion' type="number" value={editPrecio} onChange={e => setEditPrecio(e.target.value)} style={{ width: '90px' }} />
                                                : `$${Number(item.precio_unitario).toLocaleString('es-AR')}`
                                            }
                                        </td>
                                        <td>${(item.cantidad * item.precio_unitario).toLocaleString('es-AR')}</td>
                                        {detalle.estado === 'finalizado' && urlBase.includes('asesor') && (
                                            <td>
                                                {editandoId === item.id
                                                    ? <>
                                                        <button className="item-accion item-accion-guardar" onClick={() => guardarEdicion(item.id)}>✓</button>
                                                        <button className="item-accion item-accion-cancelar" onClick={() => setEditandoId(null)}>✗</button>
                                                    </>
                                                    : <>
                                                        <button className='item-accion' onClick={() => { setEditandoId(item.id); setEditCantidad(String(Math.round(item.cantidad))); setEditPrecio(String(Math.round(item.precio_unitario))) }}>✏️</button>
                                                        {confirmandoEliminarId === item.id
                                                            ? <>
                                                                <span style={{ fontSize: '12px', color: 'var(--texto-suave)' }}>¿Eliminar?</span>
                                                                <button className="item-accion item-accion-cancelar" onClick={() => eliminarItemFn(item.id)}>✓</button>
                                                                <button className="item-accion" onClick={() => setConfirmandoEliminarId(null)}>✗</button>
                                                            </>
                                                            : <button className="item-accion item-accion-cancelar" onClick={() => setConfirmandoEliminarId(item.id)}>🗑️</button>
                                                        }
                                                    </>
                                                }
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {detalle.total && (
                    <div className='detalle-totales'>
                        <div className='detalle-total-fila'>
                            <span>Total</span>
                            <span>${Number(detalle.total).toLocaleString('es-AR')}</span>
                        </div>
                        <div className='detalle-total-fila detalle-comision'>
                            <span>Comision (1%)</span>
                            <span>${Number(detalle.total * 0.01).toLocaleString('es-AR')}</span>
                        </div>
                    </div>
                )}

                {detalle.estado === 'finalizado' && urlBase.includes('asesor') && (
                    <div className='detalle-seccion agregar'>
                        {exito && <div className='cargar-exito'>{exito}</div>}
                        {!agregando ? (
                            <button className='detalle-volver' onClick={() => setAgregando(true)}>+ Agregar trabajo adicional</button>
                        ) : (
                            <AgregarItems idTurno={idTurno} urlBase={urlBase}
                                onAgregado={() => {
                                    setAgregando(false)
                                    setExito('Trabajo adicional agregado')
                                    cargarDetalle()
                                }}
                                onCancelar={() => setAgregando(false)}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>


    )
}

export default DetalleTurno