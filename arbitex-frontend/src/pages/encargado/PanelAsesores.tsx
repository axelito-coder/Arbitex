import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import '../../styles/PanelAsesores.css'

// BACKEND: lista de asesores con su estado actual
const asesores = [
  {
    id: 1,
    nombre: 'Carlos R.',
    estado: 'ocupado',
    turnoActual: { cliente: 'Juan Pérez', service: 'Service 10.000 km' },
    acumuladoSemanal: 187000,
    tiempoPromedio: 38,
  },
  {
    id: 2,
    nombre: 'Laura M.',
    estado: 'disponible',
    turnoActual: null,
    acumuladoSemanal: 142000,
    tiempoPromedio: 29,
  },
  {
    id: 3,
    nombre: 'Sofía T.',
    estado: 'ocupado',
    turnoActual: { cliente: 'Ana Gómez', service: 'Revisión general' },
    acumuladoSemanal: 165000,
    tiempoPromedio: 41,
  },
]

// BACKEND: promedio del equipo para marcar alertas
const promedioEquipo = 35

// Datos para el gráfico — se arman a partir de los asesores
const datosGrafico = asesores.map((a) => ({
  nombre: a.nombre,
  acumulado: a.acumuladoSemanal,
}))

function PanelAsesores() {
  return (
    <div className="panel">

      {/* TARJETAS DE ASESORES */}
      <div className="panel-tarjetas">
        {asesores.map((asesor) => {
          const superaPromedio = asesor.tiempoPromedio > promedioEquipo

          return (
            <div key={asesor.id} className="asesor-card">

              <div className="asesor-header">
                <div className="asesor-avatar">{asesor.nombre.charAt(0)}</div>
                <div>
                  <p className="asesor-nombre">{asesor.nombre}</p>
                  <span className={`badge-estado ${asesor.estado}`}>
                    {asesor.estado === 'ocupado' ? 'Ocupado' : 'Disponible'}
                  </span>
                </div>
              </div>

              <div className="asesor-info">
                <p className="asesor-label">Turno actual</p>
                <p className="asesor-valor">
                  {asesor.turnoActual
                    ? `${asesor.turnoActual.cliente} — ${asesor.turnoActual.service}`
                    : 'Sin turno asignado'}
                </p>
              </div>

              <div className="asesor-info">
                <p className="asesor-label">Acumulado semanal</p>
                <p className="asesor-valor">${asesor.acumuladoSemanal.toLocaleString('es-AR')}</p>
              </div>

              <div className="asesor-info">
                <p className="asesor-label">Tiempo promedio</p>
                <p className={`asesor-valor ${superaPromedio ? 'alerta' : ''}`}>
                  {asesor.tiempoPromedio} min
                  {superaPromedio && <span className="asesor-alerta"> ⚠ Supera el promedio</span>}
                </p>
              </div>

            </div>
          )
        })}
      </div>

      {/* GRÁFICO COMPARATIVO */}
      <div className="panel-grafico">
        <p className="seccion-titulo">Acumulado semanal por asesor</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={datosGrafico}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
            <XAxis dataKey="nombre" tick={{ fontSize: 13, fill: '#595959' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={(value) => typeof value === 'number' ? `$${value.toLocaleString('es-AR')}` : ''} />
            <Bar dataKey="acumulado" radius={[4, 4, 0, 0]}>
              {datosGrafico.map((_, i) => (
                <Cell key={i} fill="#EB0A1E" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}

export default PanelAsesores