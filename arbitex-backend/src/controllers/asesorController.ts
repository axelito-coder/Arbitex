import { Response } from 'express'
import pool from '../db'
import {RequestConUsuario} from '../middlewares/authMiddleware'

export async function  getPerfil(req: RequestConUsuario, res: Response) {
    try{
        const result = await pool.query(`
            SELECT u.nomre, e.acumulado_semanal, e.tiempo_promedio, e.orden_compensacion,
                   (e.acumulado_semanal * 0.01) AS comision
                FROM empleados e
                JOIN usuarios u ON u.id = e.id_usuario
                WHERE e.id_usuario = $1
            `, [req.usuario?.id])
        if(result.rows.length === 0){
            return res.status(404).json({ mensaje: 'Asesor no encontrado'})
        }

        return res.json(result.rows[0])
    }catch(err){
        console.error(err)
        return res.status(500).json({ mensaje: 'Error interno del servidor'})
    }
}

export async function  getTurnosHoy(req: RequestConUsuario, res: Response) {
    try{
        const result = await pool.query(`
            SELECT t.id, t.horario, t.tipo_service, t.estado, t.hora_inicio_atencion,
            t.hora_cierre_atencion, t.duracion_minutos,
            c.nombre AS cliente,
            v.marca || ' ' || v.modelo || ' ' || COALESCE(v.version, '') AS vehiculo
            FROM turnos t
            JOIN vehiculo_cliente vc ON vc.id = t.id_vehiculo_cliente
            JOIN clientes c ON c.id = vc.id_cliente
            JOIN vehiculos v ON v.id = vc.id_vehiculo
            JOIN empleados e ON e.id = t.id_asesor
            WHERE e.id_usuario = $1
            AND t.fecha = CURRENT DATE
            ORDER BY t.horario ASC NULLS LAST
        `, [req.usuario?.id])
        return res.json(result.rows)
    }catch(err){
        console.error(err)
        return res.status(500).json({ mensaje: 'Error interno del servidor'})
    }
}

// Obtener turnos de la semana del asesor
export async function getTurnosSemana(req: RequestConUsuario, res: Response) {
  try {
    const result = await pool.query(`
      SELECT t.id, t.fecha, t.horario, t.tipo_service, t.estado,
             t.hora_inicio_atencion, t.hora_cierre_atencion, t.duracion_minutos,
             c.nombre AS cliente,
             v.marca || ' ' || v.modelo || ' ' || COALESCE(v.version, '') AS vehiculo
      FROM turnos t
      JOIN vehiculo_cliente vc ON vc.id = t.id_vehiculo_cliente
      JOIN clientes c ON c.id = vc.id_cliente
      JOIN vehiculos v ON v.id = vc.id_vehiculo
      JOIN empleados e ON e.id = t.id_asesor
      WHERE e.id_usuario = $1
      AND t.fecha >= DATE_TRUNC('week', CURRENT_DATE)
      AND t.fecha < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
      ORDER BY t.fecha ASC, t.horario ASC NULLS LAST
    `, [req.usuario?.id])

    return res.json(result.rows)

  } catch (err) {
    console.error(err)
    return res.status(500).json({ mensaje: 'Error interno del servidor' })
  }
}

//Iniciar atencion de un turno

export async function  iniciarAtencion(req: RequestConUsuario, res: Response) {
    const { id } = req.params

    try{
        const result = await pool.query(`
            UPDATE turnos
            set estado = 'en_proceso', hora_inicio_atencion = NOW()
            WHERE id = $1
            AND id_asesor = (SELECT id FROM empleados WHERE id_usuario = $2)
            AND estado = 'asignado'
            RETURNING *
        `, [id, req.usuario?.id])

        if(result.rows.length === 0){
            return res.status(404).json({ mensaje: 'Turno no encontrado o no disponible' })
        }

        return res.json(result.rows[0])
    }catch (err){
        console.error(err)
        return res.status(500).json({mensaje: 'Error interno del servidor'})
    }
}