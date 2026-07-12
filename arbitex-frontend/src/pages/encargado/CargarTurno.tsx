import { useState } from 'react'
import '../../styles/CargarTurno.css'

const tiposDeService = [
  'Cambio de aceite',
  'Revisión de frenos',
  'Service 10.000 km',
  'Service 20.000 km',
  'Revisión general',
  'Cambio de neumáticos',
]

function CargarTurno() {
  const [form, setForm] = useState({
    cliente: '',
    tipoService: '',
    horario: '',
  })

  const [errores, setErrores] = useState({
    cliente: '',
    tipoService: '',
  })

  const [enviado, setEnviado] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrores({ ...errores, [e.target.name]: '' })
  }

  function handleSubmit() {
    const nuevosErrores = {
      cliente: '',
      tipoService: '',
    }

    if (!form.cliente)     nuevosErrores.cliente     = 'El nombre del cliente es obligatorio'
    if (!form.tipoService) nuevosErrores.tipoService = 'Seleccioná un tipo de service'

    if (nuevosErrores.cliente || nuevosErrores.tipoService) {
      setErrores(nuevosErrores)
      return
    }

    console.log('Turno a cargar:', form)

    setEnviado(true)
    setForm({ cliente: '', tipoService: '', horario: '' })
    setErrores({ cliente: '', tipoService: '' })
  }

  return (
    <div className="cargar-contenedor">

      <div className="cargar-card">

        <p className="cargar-titulo">Nuevo turno</p>

        {enviado && (
          <div className="cargar-exito">
            ✓ Turno cargado correctamente
          </div>
        )}

        <div className="cargar-campo">
          <label className="cargar-label">Cliente</label>
          <input
            className={`cargar-input ${errores.cliente ? 'input-error' : ''}`}
            type="text"
            name="cliente"
            value={form.cliente}
            onChange={handleChange}
            placeholder="Nombre del cliente"
          />
          {errores.cliente && <span className="cargar-error">{errores.cliente}</span>}
        </div>

        <div className="cargar-campo">
          <label className="cargar-label">Tipo de service</label>
          <select
            className={`cargar-input ${errores.tipoService ? 'input-error' : ''}`}
            name="tipoService"
            value={form.tipoService}
            onChange={handleChange}
          >
            <option value="">Seleccioná un tipo</option>
            {tiposDeService.map((tipo) => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
          {errores.tipoService && <span className="cargar-error">{errores.tipoService}</span>}
        </div>

        <div className="cargar-campo">
          <label className="cargar-label">
            Horario <span className="cargar-opcional">(opcional — si está vacío es tiempo real)</span>
          </label>
          <input
            className="cargar-input"
            type="time"
            name="horario"
            value={form.horario}
            onChange={handleChange}
          />
        </div>

        <button className="cargar-boton" onClick={handleSubmit}>
          Cargar turno
        </button>

      </div>

    </div>
  )
}

export default CargarTurno