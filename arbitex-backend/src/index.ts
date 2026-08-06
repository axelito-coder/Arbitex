import  express  from "express"
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import pool from './db'
import authRoutes from './routes/authRoutes'
import asesorRoutes from './routes/asesorRoutes'
import encargadoRoutes from './routes/encargadoRoutes'
import './cron/jobs'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/asesor', asesorRoutes)
app.use('/encargado', encargadoRoutes)

app.get('/', (req, res) => {
    res.json({ mensaje: 'Servidor Arbitex funcionando'})
})

// Solo para desarrollo
app.post('/admin/resetear-semana', async (req, res) => {
  try {
    await pool.query(`
      UPDATE empleados
      SET acumulado_semana_anterior = acumulado_semanal,
          acumulado_semanal = 0,
          acumulado_distribucion = 0,
          dias_trabajados_semana = 0,
          bonus_disponible = false,
          bonus_maximo = 0
    `)

    const result = await pool.query(`
      SELECT id FROM empleados
      ORDER BY acumulado_semana_anterior ASC
    `)

    for (let i = 0; i < result.rows.length; i++) {
      await pool.query(
        'UPDATE empleados SET orden_compensacion = $1 WHERE id = $2',
        [i + 1, result.rows[i].id]
      )
    }

    // Actualizar config
    const fecha = new Date()
    const lunes = new Date(fecha)
    const dia = fecha.getDay()
    const diff = dia === 0 ? -6 : 1 -dia //Si es domingo resta 6, sino resta lo que falta para lunes
    lunes.setDate(fecha.getDate() + diff)
    lunes.setHours(0, 0, 0, 0)

    //Número de semana basado en el lunes
    const jueves = new Date(lunes)
    jueves.setDate(lunes.getDate() + 3)
    const inicioAnio = new Date(jueves.getFullYear(), 0, 1)
    const diff2 = jueves.getTime() - inicioAnio.getTime()
    const semana =  Math.ceil((diff2 / 86400000 + inicioAnio.getDay() + 1) / 7)

    await pool.query(
      'UPDATE config SET semana_activa = $1, año_activo = $2 WHERE id = 1',
      [semana, fecha.getFullYear()]
    )

    return res.json({ mensaje: 'Semana reseteada correctamente' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ mensaje: 'Error interno del servidor' })
  }
})

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
})

export default app