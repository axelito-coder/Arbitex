import { useState } from "react";
import '../../styles/FinalizarTurno.css'

//En typescript cuando hacemos type ... definimos como debe ser un objeto
//Cuando typescript compila el codigo a javascript, los types no existen mas, solo sirven para detectar errores y hacer las coas mas limpias
type Item = { 
    descripcion: string
    cantidad: number
    precio_unitario: number
    tipo: 'mano_obra' | 'repuesto'
}

type Props = {
    idTurno: number
    cliente: string
    tipoService: string
    onFinalizado: () => void
    onCancelar: () => void
}

function FinalizarTurno({ idTurno, cliente, tipoService, onFinalizado, onCancelar}: Props){
    const [items, setItems] = useState<Item[]>([
        {descripcion: '', cantidad: 1, precio_unitario: 0, tipo: 'mano_obra'}
    ])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [patente, setPatente] = useState('')
    const [vehiculo, setVehiculo] = useState({
        marca: '',
        modelo: '',
        version: '',
        nro_serie: '',
        km: ''
    })
    
    //en la variable con todos los items agregamos un espacio mas 
    function agregarItem(){
        setItems([...items, {descripcion: '', cantidad: 1, precio_unitario: 0, tipo: 'repuesto'}])
    }

    function eliminarItem(index: number){
        setItems(items.filter((_,i) => i !== index))
    }

    function handleItemChange(index: number, campo: keyof Item, valor: string | number){
        const nuevos = [...items] //creamos un espacio con todos los items primero, como un backup
        nuevos[index] = {...nuevos[index], [campo]: valor} //en el item con el index pasado desde front se modifica el campo especifico
        setItems(nuevos)
    }

    const total = items.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0) //calculamos el total del turno


    async function handleFinalizar() {
        const itemsInvalidos = items.some(i => !i.descripcion || i.cantidad <= 0 || i.precio_unitario <= 0) //verificamos que todos los items esten con datos correctos
        if(itemsInvalidos){
            setError('Completa todos los items correctamente')
            return
        }
        if(!patente){
            setError('Patente obligatoria')
        }
        setLoading(true)
        setError('')

        try{
            //hacemos el post al backend para finalizar el turno
            const token = localStorage.getItem('token')
            const res = await fetch(`http://localhost:3000/asesor/turnos/${idTurno}/finalizar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ items, vehiculo, patente })
            })

            const data = await res.json()

            if(!res.ok){
                setError(data.mensaje || 'Error al finalizar el turno')
                return
            }
            onFinalizado()
        }catch{
            setError('Error al conectar con servidor')
        }finally{
            setLoading(false)
        }
    }

    return(
        <div className="finalizar-contenedor">
            <div className="finalizar-card">
                <p className="finalizar-titulo">Finalizar turno</p>
                <p className="finalizar-subtitulo">{cliente} * {tipoService}</p>

                {error && <div className="finalizar-error">{error}</div>}

                {/* DATOS DEL VEHÍCULO */}
                <div className="finalizar-item">
                 <p style={{ fontSize: 13, color: '#595959', marginBottom: 8, fontWeight: 600 }}>Vehículo</p>
                
                  <div className="item-fila">
                    <input type="text" className="item-input" placeholder="Marca"
                        value={vehiculo.marca} onChange={(e) => setVehiculo({...vehiculo, marca: e.target.value})}/>
                    <input type="text" className="item-input" placeholder="Modelo"
                        value={vehiculo.modelo} onChange={(e) => setVehiculo({...vehiculo, modelo: e.target.value})}/>
                  </div>

                  <input type="text" className="item-input" placeholder="Versión (opcional)"
                    value={vehiculo.version} onChange={(e) => setVehiculo({...vehiculo, version: e.target.value})}
                    style={{ marginTop: 8 }}/>

                  <div className="item-fila" style={{ marginTop: 8 }}>
                    <input type="text" className="item-input" placeholder="Patente"
                        value={patente} onChange={(e) => setPatente(e.target.value.toUpperCase())}/>
                    <input type="number" className="item-input" placeholder="KM"
                        value={vehiculo.km} onChange={(e) => setVehiculo({...vehiculo, km: e.target.value})}/>
                  </div>

                  <input type="text" className="item-input" placeholder="Nro. de serie (opcional)"
                    value={vehiculo.nro_serie} onChange={(e) => setVehiculo({...vehiculo, nro_serie: e.target.value})}
                    style={{ marginTop: 8 }}/>
                </div>

                {/*ITEMS*/}
                <div className="finalizar-items">
                    {
                        items.map((item, i) => (
                            <div key={i} className="finalizar-item">
                                <div className="item-fila">
                                    <select className="item-fila" value={item.tipo} onChange={(e) => handleItemChange(i, 'tipo', e.target.value)} >
                                        <option value="mano_obra">Mano de obra</option>
                                        <option value="repuesto">Repuesto</option>
                                    </select>

                                    {items.length > 1 &&(
                                        <button className="item-eliminar" onClick={() => eliminarItem(i)}>✕</button>
                                    )}
                                </div>

                                <input type="text" className="item-input" placeholder="Descripcion" value={item.descripcion} onChange={(e) => handleItemChange(i, 'descripcion', e.target.value)} />

                                <div className="item-fila">
                                    <input type="number" min={1}  className="item-input item-numero" placeholder="Cantidad" disabled= {item.tipo === 'mano_obra'} value={item.cantidad} onChange={(e) => handleItemChange(i, 'cantidad', parseFloat(e.target.value))}/>
                                    <input type="number" min={1} className="item-input item-numero" placeholder="Precio unitario" value={item.precio_unitario} onChange={(e) => handleItemChange(i, 'precio_unitario', parseFloat(e.target.value))} />
                                </div>
                            </div>
                        ))
                    }
                </div>
                <button className="finalizar-agregar" onClick={agregarItem}>
                    + Agregar item
                </button>

                <div className="finalizar-total">
                    <span>Total</span>
                    <span>${total ? total.toLocaleString('es-AR') : 0}</span>
                </div>

                <div className="finalizar-botones">
                    <button className="finalizar-btn-cancelar" onClick={onCancelar}>
                        Cancelar
                    </button>

                    <button className="finalizar-btn-confirmar" onClick={handleFinalizar} disabled={loading}>
                        {loading ? 'Finalizando...' : 'Confirmar y Finalizar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FinalizarTurno