import { useEffect, useState } from 'react'
import '../styles/DetalleTurno.css'


//En typescript cuando hacemos type ... definimos como debe ser un objeto
//Cuando typescript compila el codigo a javascript, los types no existen mas, solo sirven para detectar errores y hacer las coas mas limpias
type Item = {
    descripcion: string,
    cantidad: number,
    precio_unitario: number,
    tipo: String
}


//para trabajar con todo el turno
type Detalle = {
    id: number,
    fecha: String,
    hora_carga: String,
    tipo_service: String
    estado: String,
    cliente: String,
    cuit: String,
    telefono: String,
    condicion_iva: String,
    marca: String,
    modelo: String,
    version: String,
    nro_serie: String,
    km: number,
    asesor: String,
    nro_factura: String
    total: number,
    comision: number,
    duracion_minutos: number | null
    items: Item[]
}


type Props = {
    idTurno: number,
    onVolver: () => void
    urlBase: string //la url porque asesor y encargado tienen en sus respectivos rutas y controladores una funcion para traer todo el turno
}

function DetalleTurno({ idTurno, onVolver, urlBase }: Props){
    const [detalle, setDetalle] = useState<Detalle | null>(null)

    useEffect(() => {
        async function  cargarDetalle() {
            try{
                const token = localStorage.getItem('token')
                const res = await fetch(`${urlBase}/turnos/${idTurno}/detalle`, {  //traemos el turno
                    headers: { Authorization: `Bearer ${token}`}
                })
                const data = await res.json()
                if(res.ok) setDetalle(data)
            }catch (err){
           console.error(err)   
        } 
        }
        cargarDetalle()
    }, [idTurno])

    if(!detalle){
        return <p className='seccion-titulo'>Error al caregar el turno...</p>
    }

    function imprimirPDF(){
        window.print()
    }

    return(
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
                </div>

                <div className='detalle-seccion'>
                    <p className='detalle-label'>Cliente</p>
                    <p className='detalle-valor'>{detalle.cliente}</p>
                    {detalle.cuit && <p className='detalle-sub'>CUIT: {detalle.cuit}</p>}
                    {detalle.telefono && <p className='detalle-sub'>Tel: {detalle.telefono}</p>}
                    {detalle.condicion_iva && <p className='detalle-sub'>CUIT: {detalle.condicion_iva}</p>}
                </div>

                <div className='detalle-seccion'>
                    <p className='detalle-label'>Vehiculo</p>
                    <p className='detalle-valor'>{detalle.marca} {detalle.modelo}</p>
                    {detalle.version && <p className='detalle-sub'>Version: {detalle.version}</p>}
                    {detalle.nro_serie && <p className='detalle-sub'>Tel: {detalle.nro_serie}</p>}
                    {detalle.km && <p className='detalle-sub'>CUIT: {detalle.km.toLocaleString('es-AR')}</p>}
                </div>


                <div className='detalle-seccion'>
                    <p className='detalle-label'>Service</p>
                    <p className='detalle-valor'>{detalle.tipo_service}</p>
                    <p className='detalle-sub'>{detalle.asesor}</p>
                    {detalle.duracion_minutos && <p className='detalle-sub'>Duracion: {Math.round(detalle.duracion_minutos)} min</p>}
                    {detalle.telefono && <p className='detalle-sub'>Tel: {detalle.telefono}</p>}
                    {detalle.condicion_iva && <p className='detalle-sub'>CUIT: {detalle.condicion_iva}</p>}
                </div>

                {detalle.items && detalle.items.length > 0 && (
                    <div className='detalle-seccion'>
                        <p className='detalle-label'>Items</p>
                        <table className='tabla'>
                            <thead>
                                <tr>
                                    <th>Descripcion</th>
                                    <th>Tipo</th>
                                    <th>Cant</th>
                                    <th>Precio unitario</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    detalle.items.map((item, i) =>(
                                        <tr key={i}>
                                            <td>{item.descripcion}</td>
                                            <td>{item.tipo === 'mano_obra' ? 'Mano de obra' : 'Repuesto'}</td>
                                            <td>{item.cantidad}</td>
                                            <td>${Number(item.precio_unitario).toLocaleString('es-AR')}</td>
                                            <td>${(item.cantidad * item.precio_unitario).toLocaleString('es-AR')}</td>
                                        </tr>
                                    ))
                                }
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
                            <span>Comision ($1)</span>
                            <span>${Number(detalle.comision).toLocaleString('es-AR')}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>

        
    )
}

export default DetalleTurno