import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts'
import '../../styles/MiPerfil.css'

// BACKEND: datos del asesor logueado
const datosAsesor = { nombre: 'Carlos R.', rol: 'Asesor de servicio' }

// BACKEND: métricas reales de la semana
const metricas = {
  acumuladoSemanal: 187000,
  comision: 14000,
  turnosSemana: 11,
  tiempoPromedio: 38,   // minutos, del asesor
  promedioEquipo: 35,   // minutos, para comparar y pintar en naranja si lo supera
}

// BACKEND: monto acumulado por día de la semana actual
const acumuladoPorDia = [
  { dia: 'Lun', monto: 32000 },
  { dia: 'Mar', monto: 28000 },
  { dia: 'Mié', monto: 41000 },
  { dia: 'Jue', monto: 25000 },
  { dia: 'Vie', monto: 61000 },
  { dia: 'Sáb', monto: 0 },
  { dia: 'Dom', monto: 0 },
]
const diaActual = 'Vie' // BACKEND: día de hoy

// BACKEND: duración de cada turno finalizado de la semana
const tiemposPorTurno = [
  { turno: 'María López', minutos: 32 },
  { turno: 'Sofía Torres', minutos: 41 },
  { turno: 'Juan Pérez', minutos: 29 },
  { turno: 'Luis Herrera', minutos: 48 },
]

function MiPerfil() {
  const [grafico, setGrafico] = useState<'acumulado' | 'tiempos'>('acumulado')
  const superaPromedio = metricas.tiempoPromedio > metricas.promedioEquipo

  return (
    <div className="mi-perfil">

      {/* HEADER */}
      <div className="perfil-header">
        <div className="perfil-avatar">{datosAsesor.nombre.charAt(0)}</div>
        <div>
          <p className="perfil-nombre">{datosAsesor.nombre}</p>
          <p className="perfil-rol">{datosAsesor.rol}</p>
        </div>
      </div>

      {/* TARJETAS */}
      <div className="perfil-tarjetas">
        <div className="tarjeta">
          <p className="tarjeta-valor">${metricas.acumuladoSemanal.toLocaleString('es-AR')}</p>
          <p className="tarjeta-label">Acumulado semanal</p>
        </div>
        <div className="tarjeta">
          <p className="tarjeta-valor">${metricas.comision.toLocaleString('es-AR')}</p>
          <p className="tarjeta-label">Comisión generada</p>
        </div>
        <div className="tarjeta">
          <p className="tarjeta-valor">{metricas.turnosSemana}</p>
          <p className="tarjeta-label">Turnos de la semana</p>
        </div>
        <div className="tarjeta">
          {/* Se pinta naranja si el asesor supera el promedio del equipo */}
          <p className={`tarjeta-valor ${superaPromedio ? 'valor-alerta' : ''}`}>
            {metricas.tiempoPromedio} min
          </p>
          <p className="tarjeta-label">Tiempo promedio</p>
        </div>
      </div>

      {/* GRAFICOS */}
      <div className="perfil-seccion">
        <div className="grafico-botones">
          <button
            className={`btn-grafico ${grafico === 'acumulado' ? 'activo' : ''}`}
            onClick={() => setGrafico('acumulado')}
          >
            Acumulado
          </button>
          <button
            className={`btn-grafico ${grafico === 'tiempos' ? 'activo' : ''}`}
            onClick={() => setGrafico('tiempos')}
          >
            Tiempos
          </button>
        </div>

        {grafico === 'acumulado' ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={acumuladoPorDia}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 13, fill: '#595959' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(value) => typeof value === 'number' ? `$${value.toLocaleString('es-AR')}` : ''} />
              <Bar dataKey="monto" radius={[4, 4, 0, 0]}>
                <LabelList
                  dataKey="monto"
                  position="top"
                  formatter={(v) =>
                    typeof v === 'number' && v > 0 ? `$${(v / 1000).toFixed(0)}k` : ''
                  }
                  style={{ fontSize: 12, fill: '#595959' }}
                />
                {/* El día actual va rojo completo, el resto con opacidad */}
                {acumuladoPorDia.map((d, i) => (
                  <Cell key={i} fill={d.dia === diaActual ? '#EB0A1E' : '#EB0A1E80'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, tiemposPorTurno.length * 50)}>
            <BarChart data={tiemposPorTurno} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                dataKey="turno" type="category"
                tick={{ fontSize: 13, fill: '#595959' }}
                axisLine={false} tickLine={false} width={110}
              />
              <Tooltip formatter={(value) => typeof value === 'number' ? `${value} min` : ''} />
              <Bar dataKey="minutos" radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="minutos" position="right"
                  formatter={(value) => value != null ? `${value} min` : ''}
                  style={{ fontSize: 12, fill: '#595959' }}
                />
                {/* Verde si está dentro del promedio del equipo, naranja si lo supera */}
                {tiemposPorTurno.map((t, i) => (
                  <Cell key={i} fill={t.minutos > metricas.promedioEquipo ? '#F59E0B' : '#10B981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  )
}

export default MiPerfil