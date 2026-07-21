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
          acumulado_semanal = 0
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
    const semana = Math.ceil((fecha.getDate() - fecha.getDay()) / 7)
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