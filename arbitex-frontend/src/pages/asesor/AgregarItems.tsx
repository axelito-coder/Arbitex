import { useState } from "react";
import '../../styles/FinalizarTurno.css'
type Item = {
    descripcion: string,
    cantidad: number,
    precio_unitario: number,
    tipo: 'mano_obra' | 'repuesto'
}

type Props = {
    idTurno: number,
    urlBase: string,
    onAgregado: () => void
    onCancelar: () => void
}

function AgregarItems({ idTurno, urlBase, onAgregado, onCancelar}: Props){
    const [items, setItems] = useState<Item[]>([
        {descripcion: '', cantidad: 1, precio_unitario: 0, tipo: 'repuesto'}
    ])

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    function AgregarItem(){
        setItems([...items, {descripcion: '', cantidad: 1, precio_unitario: 0, tipo: 'repuesto'}])
    }

    function eliminarItem(index: number){
        setItems(items.filter((_, i) => i !== index))
    }

    function handleItemChange(index: number, campo: keyof Item, valor: string | number){
        const nuevos = [...items]
        nuevos[index] = {...nuevos[index], [campo]: valor}

        if(campo === 'tipo' &&  valor === 'mano_obra'){
            nuevos[index].cantidad = 1;
        }
        setItems(nuevos)
    }

    let total = 0
    for(const item of items){
        total += item.cantidad * item.precio_unitario
    }
    async function  handleConfirmar() {
        const invalidos = items.some(i => !i.descripcion || i.cantidad <= 0 || i.precio_unitario <= 0)
        if(invalidos){
            setError('completa todos los items correctamente')
            return
        }
        setLoading(true)
        setError('')
        try{
           const token = localStorage.getItem('token')
           const res = await fetch(`${urlBase}/turnos/${idTurno}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ items })
           })
           const data = await res.json()
           if(!res.ok){
            setError(data.mensaje)
            return
           }
           onAgregado()
        }catch{
            setError('Error al conectar el servidor')
        }finally{
            setLoading(false)
        }
    }
    return(
        <div className="fnalizar-card" style={{marginTop: 16}}>
            <p className="finalizar-titulo">Agregar trabajo adicional</p>

            {error && <div className="finalizar-error">{error}</div>}
            <div className="finalizar-items">
                {items.map((item, i) => (
                    <div key={i} className="finalizar-item">
                        <div className="item-fila">
                            <select className="item-tipo" value={item.tipo}
                            onChange={(e) => handleItemChange(i, 'tipo', e.target.value)}>
                                <option value="mano_obra">Mano de obra</option>
                                <option value="repuesto">Repuesto</option>
                            </select>
                            {items.length > 1 && (
                                <button className="item-eliminar" onClick={() => eliminarItem(i)}>✕</button>
                            )}
                        </div>
                        <input type="text" className="item-input" placeholder="descripcion"
                        value={item.descripcion} onChange={(e) => handleItemChange(i, 'descripcion', e.target.value)}/>

                        <div className="item-fila">
                            <input type="number" className="item-input item-numero" placeholder="Cantidad" value={item.cantidad}
                            onChange={(e) => handleItemChange(i, 'cantidad', parseFloat(e.target.value))}  disabled= {item.tipo === 'mano_obra'}/>

                            <input type="number" className="item-input item-numero" placeholder="Precio" value={item.precio_unitario}
                            onChange={(e) => handleItemChange(i, 'precio_unitario', parseFloat(e.target.value))} />
                        </div>
                    </div>
                ))}
            </div>

            <button className="finalizar-agregar" onClick={AgregarItem}>+ Agregar item</button>

            <div className="finalizar-total">
                <span>Total adicional</span>
                <span>${total ? total.toLocaleString('es-AR') : 0}</span>
            </div>

            <div className="finalizar-botones">
                <button className="finalizar-btn-cancelar" onClick={onCancelar}>Cancelar</button>
                <button className="finalizar-btn-confirmar" onClick={handleConfirmar} disabled={loading}>{loading ? 'Guardando...' : 'Confirmar'}</button>
            </div>
        </div>
    )
}

export default  AgregarItems