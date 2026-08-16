import { useState } from "react";

import '../../styles/CargarTurno.css'

const tipoDeService =[
  'Cambio de aceite',
  'Revisión de frenos',
  'Service 10.000 km',
  'Service 20.000 km',
  'Revisión general',
  'Cambio de neumáticos',
]

function CargarTurno(){
  const [form, setForm] = useState({
    nombre_cliente: '',
    email: '',
    telefono: '',
    dni: '',
    tipoService: ''
  })
  const [errores, setErrores] = useState({
    nombre_cliente: '',
    tipoService: '',
    contacto: '',
    dni: ''
  })

  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>){
    setForm({...form, [e.target.name]: e.target.value})
    setErrores({...errores, [e.target.name]: ''})
    setEnviado(false)
    setError('')
  }

  async function handleSubmit() {
    const nuevosErrores = { nombre_cliente: '', tipoService: '', contacto: '', dni: ''}

    if(!form.nombre_cliente){
      nuevosErrores.nombre_cliente = 'El nombre del cliente es obligatorio'
    }
    if(!form.tipoService){
      nuevosErrores.tipoService = 'Seleccione un tipo de service'
    }
    if (!form.email && !form.telefono) {
     nuevosErrores.contacto =  'Ingresá al menos email o teléfono'
    }
    if (!form.dni) {
      nuevosErrores.dni = 'El DNI es obligatorio'
    }     

    if(nuevosErrores.nombre_cliente || nuevosErrores.tipoService || nuevosErrores.contacto){
        setErrores(nuevosErrores)
        return
    }

    setLoading(true)
    setError('')
    try{//hacemos el post para cargar turno
       const token = localStorage.getItem('token')
       const res = await fetch('http://localhost:3000/encargado/turnos', {
        method: 'POST',
        headers:{
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre_cliente: form.nombre_cliente,
          email: form.email || null,
          telefono: form.telefono,
          dni: form.dni,
          tipo_service:   form.tipoService,
        })
       })

       const data = await res.json()

       if(!res.ok){
        setError(data.mensaje || 'Error al cargar el turno')
        return
       }
      setEnviado(true)
      setForm({ nombre_cliente: '', email: '', telefono: '', dni: '', tipoService: ''})
      setErrores({ nombre_cliente: '', tipoService: '', contacto: '', dni: '' })
    }catch{
      setError('Error al conectar con el servidor')
    }finally{
      setLoading(false)
    }
  }
  return (
  <div className="cargar-contenedor">
    <div className="cargar-card">

      <p className="cargar-titulo">Nuevo turno</p>

      {enviado && <div className="cargar-exito">✓ Turno cargado correctamente</div>}
      {error   && <div className="cargar-error">{error}</div>}

      <div className="cargar-campo">
        <label className="cargar-label">Cliente</label>
        <input className={`cargar-input ${errores.nombre_cliente ? 'input-error' : ''}`}
          type="text" name="nombre_cliente" value={form.nombre_cliente}
          onChange={handleChange} placeholder="Nombre del cliente"/>
        {errores.nombre_cliente && <span className="cargar-error">{errores.nombre_cliente}</span>}
      </div>

      <div className="cargar-campo">
        <label className="cargar-label">DNI</label>
        <input className={`cargar-input ${errores.dni ? 'input-error' : ''}`}
         type="text" name="dni" value={form.dni}
        onChange={handleChange} placeholder="12345678"/>
        {errores.dni && <span className="cargar-error">{errores.dni}</span>}
      </div>

      <div className="cargar-campo">
        <label className="cargar-label">Email</label>
        <input className="cargar-input" type="email" name="email"
        value={form.email} onChange={handleChange} placeholder="cliente@email.com"/>
      </div>

      <div className="cargar-campo">
        <label className="cargar-label">Teléfono</label>
        <input className="cargar-input" type="text" name="telefono"
        value={form.telefono} onChange={handleChange} placeholder="011-1234-5678"/>
        {errores.contacto && <span className='cargar-error'>{errores.contacto}</span>}
      </div>

      <div className="cargar-campo">
        <label className="cargar-label">Tipo de service</label>
        <select className={`cargar-input ${errores.tipoService ? 'input-error' : ''}`}
          name="tipoService" value={form.tipoService} onChange={handleChange}>
          <option value="">Seleccioná un tipo</option>
          {tipoDeService.map((tipo) => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>
        {errores.tipoService && <span className="cargar-error">{errores.tipoService}</span>}
      </div>

      

      <button className="cargar-boton" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Cargando...' : 'Cargar turno'}
      </button>

    </div>
  </div>
)
}
export default CargarTurno