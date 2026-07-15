// Tipos compartidos entre asesor y encargado

export type Estado =
  | 'Pendiente'
  | 'Asignado'
  | 'En proceso'
  | 'Finalizado'
  | 'No presentado'
  | 'Anulado'

export type Turno = {
  id: number
  hora: string
  cliente: string
  vehiculo: string
  service: string
  monto: number
  estado: Estado
  duracion?: string // solo se completa cuando el turno está Finalizado
}