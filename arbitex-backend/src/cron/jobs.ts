import cron from 'node-cron'
import pool from '../db'

//Resetear el acumulado semanal -- todos los lunes a las 00:00
cron.schedule('0 0 * * 1', async () =>{
    console.log('Cron: reseteando acumulado semanal...')

    try{
        await pool.query(`
            UPDATE empleados
            SET acumulado_semana_anterior = acumulado_semanal,
            acumulado_semanal = 0
        `)

        const result = await pool.query(`
            SELECT id from empleados
            ORDER BY acumulado_semana_anterior ASC

        `)

        for (let i = 0; i < result.rows.length; i++){
            await pool.query(`UPDATE empleados SET orden_compensacion = $1 WHERE id = $2,`,
                [i + 1, result.rows[i].id]
            )
        }
        console.log('CRON: acumulado semanal reseteado correctamente')
    } catch (err){
        console.error('Cron error (reseteo semanal):', err)
    }
})

console.log('Cron jobs iniciados')