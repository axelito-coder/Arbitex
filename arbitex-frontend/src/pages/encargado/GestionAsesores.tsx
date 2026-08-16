import { useEffect, useState } from 'react'
import '../../styles/GestionAsesores.css'
type Asesor = {
    id_usuario: number
    nombre: string
    email: string
    sesion_activa: boolean
}

function GestionAsesores(){
    const [ asesores, setAsesores ] = useState<Asesor[]>([])
    const [ loading, setLoading ] = useState(true)
    const [ modo, setModo ] = useState<'lista' | 'crear' | 'editar'>('lista')//es la herramienta principal para elegir que mostrar en el componente
    const [ asesorEditando, setAsesorEditando ] = useState<Asesor | null>(null) //lo usamos para completar el formulario de editando
    const [ form, setForm ] = useState({ nombre: '', email: '', password: ''}) //array del formulario
    const [error, setError] = useState('') //para mostrar los errores
    const [exito, setExito] = useState('')

    useEffect(() => { //traemos los asesores
        cargarAsesores()
    }, [])

    async function  cargarAsesores() { //traemos todos los asesores
        try{
            const token = localStorage.getItem('token')
            const res = await fetch('http://localhost:3000/encargado/asesores', {
                headers: { Authorization: `Bearer ${token}`}
            })
            const data = await res.json()
            if(res.ok){
                setAsesores(data)
            }
        }catch(err){
            console.error(err)
        }finally{
            setLoading(false)
        }
    }

    async function  handleGuardar() {
        setError('')
        setExito('')

        if(!form.nombre || !form.email){
            setError('Nombre y email son obligatorios')
            return
        }

        if(modo === 'crear' && !form.password){
            setError('La contraseña es obligatoria')
            return
        }

        try{
            const token = localStorage.getItem('token')
            const url = modo === 'crear' ? 'http://localhost:3000/encargado/asesores'
                                         : `http://localhost:3000/encargado/asesores/${asesorEditando?.id_usuario}` //segun el modo determinado se elige la ruta a la que el fetch va
            
            console.log('asesorEditando:', asesorEditando)
            console.log('url:', url)
            const res = await fetch(url, {
                method: modo === 'crear' ? 'POST' : 'PUT', //si es crear , POST, si es editar PUT
                headers: {
                    'Content-Type' : 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            })
            const data = await res.json()

            if(!res.ok){
                setError(data.mensaje)
                return
            }
            setExito(data.mensaje)
            setForm({ nombre: '', email: '', password: ''})
            setModo('lista')
            cargarAsesores()
        }catch{
            setError('Error al conectar con el servidor')
        }
    }

    async function  handleDesactivar(id: number) {
        try{
            const token = localStorage.getItem('token')
            await fetch(`http://localhost:3000/encargado/asesores/${id}/desactivar`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`}
            })
            cargarAsesores()
        }catch(err){
            console.error(err)
        }
    }

    function abrirEditar(asesor: Asesor){
        setAsesorEditando(asesor)
        setForm({nombre: asesor.nombre, email: asesor.email, password: ''})
        setModo('editar')
        setError('')
        setExito('')
    }

    if(loading){
        return <p className='seccion-titulo'>Cargando...</p>
    }

    if(modo === 'crear' || modo === 'editar'){ //aca segun si el modo es de editar o crear se cambia lo que muestra el componente,
        //como crear y editar usan el mismo formulario, se puede usar lo mismo, solamente para editar se muestra ya los datos existentes
        
        //Esto después lo voy a modificar para tratar que sea un componente diferente, no es bueno tener tanto código así
        return(
            <div className='gestion-form'>
                <div className='gestion-card'>
                    <p className='gestion-titulo'>{modo === 'crear' ? 'Nuevo asesor' : 'Editar asesor'}</p>

                    {error && <div className='gestion-error'>{error}</div>}


                    <div className='gestion-campo'>
                        <label className='gestion-label'>Nombre</label>
                        <input type="text" className='gestion-input' value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} placeholder='Nombre de asesor...' />
                    </div>
                    <div className='gestion-campo'>
                        <label className='gestion-label'>Email</label>
                        <input type="email" className='gestion-input' value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder='email de asesor...' />
                    </div>

                    <div className='gestion-campo'>
                        <label className='gestion-label'>Contraseña {modo === 'editar' && <span className='gestion-opcional'>dejar vacio para no cambiar</span>}</label>
                        <input type="password" className='gestion-input' value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder='••••••••' />
                    </div>

                    <div className='gestion-botones'>
                        <button className='gestion-btn-cancelar' onClick={() => { setModo('lista'); setError('')}}>
                            Cancelar
                        </button>

                        <button className='gestion-btn-guardar' onClick={handleGuardar}>
                            {modo === 'crear' ? 'Crear Asesor' : 'Guardar cambios'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return(
        <div className='gestion'>
            <div className='gestion-header'>
                <p className='seccion-titulo'>Asesores ({asesores.length})</p>
                <button className='gestion-btn-nuevo' onClick={() => {setModo('crear'); setForm({nombre: '', email: '', password: ''})}}>
                    + Nuevo asesor
                </button>
            </div>

            {exito && <div className='gestion-exito'>{exito}</div>}

            <div className='tabla-contenedor'>
                <table className='tabla'>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {asesores.map((a) => (
                            <tr key={a.id_usuario}>
                                <td>{a.nombre}</td>
                                <td>{a.email}</td>
                                <td>
                                    <span className={`badge ${a.sesion_activa ? 'badge-verde' : 'badge-gris'}`}>
                                        {a.sesion_activa ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8}}>
                                        <button className='gestion-btn-editar' onClick={() => abrirEditar(a)}>
                                            Editar
                                        </button>
                                        {a.sesion_activa && (
                                            <button className='gestion-btn-desactivar' onClick={() => handleDesactivar(a.id_usuario)}>
                                                Desactivar
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )

}

export default GestionAsesores