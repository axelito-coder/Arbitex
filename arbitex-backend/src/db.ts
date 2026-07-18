import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

console.log('DB_PASSWORD:', process.env.DB_PASSWORD) // para verificar
const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})

pool.connect()
 .then(() => console.log('Conectado a PostgreSQL'))
 .catch((err) => console.error('Error al conectar a PostgreSQL:', err))

 export default pool