import  express  from "express"
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import './db'
import authRoutes from './routes/authRoutes'
import asesorRoutes from './routes/asesorRoutes'
import encargadoRoutes from './routes/encargadoRoutes'

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

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
})

export default app