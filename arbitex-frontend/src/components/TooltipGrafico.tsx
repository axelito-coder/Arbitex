type TooltipProps = { 
  active?: boolean
  payload?: { dataKey: string, name: string, value: number }[]
  label?: string
}
{/*Todo esto es para que la tarjeta de rendimiento de cada asesor  en el panel del encargado se vea bien, para los demas graficos esto no hace falta*/}
export function TooltipGrafico({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E0E0E0',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 12,
      color: '#595959'
    }}>
      <p style={{ fontWeight: 600, marginBottom: 6 }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.dataKey === 'acumulado' ? '#EB0A1E' : '#888', margin: '2px 0' }}>
          {entry.name}: ${Number(entry.value).toLocaleString('es-AR')}
        </p>
      ))}
    </div>
  )
}