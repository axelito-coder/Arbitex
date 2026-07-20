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
    marca: '',
    modelo: '',
    version: '',
    nro_serie: '',
    km: '',
    tipoService: ''
  })
  const [errores, setErrores] = useState({
    nombre_cliente: '',
    tipoService: '',
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
    const nuevosErrores = { nombre_cliente: '', tipoService: ''}

    if(!form.nombre_cliente){
      nuevosErrores.nombre_cliente = 'El nombre del cliente es obligatorio'
    }
    if(!form.tipoService){
      nuevosErrores.tipoService = 'Seleccione un tipo de service'
    }

    if(nuevosErrores.nombre_cliente || nuevosErrores.tipoService){
        setErrores(nuevosErrores)
        return
    }

    setLoading(true)
    setError('')
    try{
       const token = localStorage.getItem('token')
       const res = await fetch('http://localhost:3000/encargado/turnos', {
        method: 'POST',
        headers:{
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre_cliente: form.nombre_cliente,
          marca:          form.marca || null,
          modelo:         form.modelo || null,
          version:        form.version || null,
          nro_serie:      form.nro_serie || null,
          km:             form.km ? parseInt(form.km) : null,
          tipo_service:   form.tipoService,
        })
       })

       const data = await res.json()

       if(!res.ok){
        setError(data.mensaje || 'Error al cargar el turno')
        return
       }
      setEnviado(true)
      setForm({ nombre_cliente: '', marca: '', modelo: '', version: '', nro_serie: '', km: '', tipoService: ''})
      setErrores({ nombre_cliente: '', tipoService: '' })
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
        <label className="cargar-label">Marca</label>
        <input className="cargar-input" type="text" name="marca"
          value={form.marca} onChange={handleChange} placeholder="Toyota"/>
      </div>

      <div className="cargar-campo">
        <label className="cargar-label">Modelo</label>
        <input className="cargar-input" type="text" name="modelo"
          value={form.modelo} onChange={handleChange} placeholder="Corolla"/>
      </div>

      <div className="cargar-campo">
        <label className="cargar-label">Versión <span className="cargar-opcional">(opcional)</span></label>
        <input className="cargar-input" type="text" name="version"
          value={form.version} onChange={handleChange} placeholder="1.8 eCVT"/>
      </div>

      <div className="cargar-campo">
        <label className="cargar-label">Nro. de serie <span className="cargar-opcional">(opcional)</span></label>
        <input className="cargar-input" type="text" name="nro_serie"
          value={form.nro_serie} onChange={handleChange} placeholder="ABC123456"/>
      </div>

      <div className="cargar-campo">
        <label className="cargar-label">Kilometraje <span className="cargar-opcional">(opcional)</span></label>
        <input className="cargar-input" type="number" name="km"
          value={form.km} onChange={handleChange} placeholder="45000"/>
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