import { Response } from 'express'
import pool from '../db'
import {RequestConUsuario} from '../middlewares/authMiddleware'


export async function  getDetalleTurno(req:RequestConUsuario, res: Response) {
    const { id } = req.params

    try{
        const turnoResult = await pool.query(`
            SELECT t.id, t.fecha, t.hora_carga, t.hora_inicio_atencion, t.hora_cierre_atencion,
              t.duracion_minutos, t.tipo_service, t.estado, t.es_compensacion,
              c.nombre AS cliente, c.telefono, c.email,
              v.marca, v.modelo, v.version,
              vc.nro_serie, vc.km, vc.patente,
              u.nombre AS asesor,
              f.nro_factura, f.total
            FROM turnos t
            JOIN vehiculo_cliente vc ON vc.id = t.id_vehiculo_cliente
            JOIN clientes c ON c.id = vc.id_cliente
            JOIN vehiculos v ON v.id = vc.id_vehiculo
            LEFT JOIN empleados e ON e.id = t.id_asesor
            LEFT JOIN usuarios u ON u.id = e.id_usuario
            LEFT JOIN facturas f ON f.id_turno = t.id
            WHERE t.id = $1
        `, [id])
        if(turnoResult.rows.length === 0){
            return res.status(404).json({ mensaje: 'Turno no encontrado'})
        }
        const itemsResult = await pool.query(`
            SELECT descripcion, cantidad, precio_unitario, tipo
            FROM items_turno
            WHERE id_turno = $1
        `, [id])
        return res.json({...turnoResult.rows[0], items: itemsResult.rows})
    }catch (err){
        console.error(err)
        return res.status(500).json({ mensaje: 'Error interno del servidor'})
    }
}
export async function  getPerfil(req: RequestConUsuario, res: Response) {
    try{
        const result = await pool.query(`
            SELECT u.nombre, e.acumulado_semanal, e.tiempo_promedio, e.orden_compensacion,
                   (e.acumulado_semanal * 0.01) AS comision
                FROM empleados e
                JOIN usuarios u ON u.id = e.id_usuario
                WHERE e.id_usuario = $1
            `, [req.usuario?.id])
        if(result.rows.length === 0){
            return res.status(404).json({ mensaje: 'Asesor no encontrado'})
        }


        //acumulado por día de la semana
        const acumuladoPorDia = await pool.query(`
            SELECT t.fecha, COALESCE(SUM(f.total), 0) AS total
            FROM turnos t
            LEFT JOIN facturas f ON f.id_turno = t.id
            JOIN empleados e ON e.id = t.id_asesor
            WHERE e.id_usuario = $1
            AND t.fecha >= DATE_TRUNC('week', CURRENT_DATE)
            AND t.fecha < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
            AND t.estado = 'finalizado'
            GROUP BY t.fecha
            ORDER BY t.fecha ASC
        `, [req.usuario?.id]) 

        return res.json({...result.rows[0], acumulado_por_dia: acumuladoPorDia.rows})
    }catch(err){
        console.error(err)
        return res.status(500).json({ mensaje: 'Error interno del servidor'})
    }
}

export async function  getTurnosHoy(req: RequestConUsuario, res: Response) {
    try{
        const result = await pool.query(`
            SELECT t.id, t.hora_carga, t.tipo_service, t.estado, t.hora_inicio_atencion,
            t.hora_cierre_atencion, t.duracion_minutos,
            c.nombre AS cliente,
            CASE
             WHEN v.id IS NULL THEN 'Sin especificar'
             ELSE v.marca || ' ' || v.modelo || ' ' || COALESCE(v.version, '')
            END AS vehiculo
            FROM turnos t
            JOIN vehiculo_cliente vc ON vc.id = t.id_vehiculo_cliente
            JOIN clientes c ON c.id = vc.id_cliente
            LEFT JOIN vehiculos v ON v.id = vc.id_vehiculo
            JOIN empleados e ON e.id = t.id_asesor
            WHERE e.id_usuario = $1
            AND t.fecha = CURRENT_DATE
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
      SELECT t.id, t.fecha, t.hora_carga, t.tipo_service, t.estado,
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
      ORDER BY t.fecha ASC, t.hora_carga ASC NULLS LAST
    `, [req.usuario?.id])

    return res.json(result.rows)

  } catch (err) {
    console.error(err)
    return res.status(500).json({ mensaje: 'Error interno del servidor' })
  }
}


export async function  finalizarTurno(req: RequestConUsuario, res: Response) {
    const { id } = req.params
    const { items, vehiculo, patente } = req.body
    console.log('patente recibida', patente)
    // items: [{Descripcion, cantidad, precio_unitario, tipo}]

    if(!items || items.length === 0){
        return res.status(400).json({ mensaje : 'Debe cargar al menos un item'})
    }

    try{
        //1. Registrar cierre del turno

        const turnoResult = await pool.query(`
            UPDATE turnos
            SET estado = 'finalizado',
                hora_cierre_atencion = NOW(),
                duracion_minutos = EXTRACT(EPOCH FROM (NOW() - hora_inicio_atencion)) / 60
            WHERE id = $1
            AND id_asesor = (SELECT id from empleados WHERE id_usuario = $2)
            AND estado = 'en_proceso'
            RETURNING *   
        `, [id, req.usuario?.id])

        if(turnoResult.rows.length === 0){
            return res.status(404).json({ mensaje: 'Turno no encontrado o no esta en proceso'})
        }

        //2. Insertar items

        for (const item of items){
            await pool.query(`
                INSERT INTO items_turno (id_turno, descripcion, cantidad, precio_unitario, tipo)
                VALUES ($1, $2, $3, $4, $5)
            `, [id, item.descripcion, item.cantidad, item.precio_unitario, item.tipo])
        }

        //3. Calcular total

        const totalResult = await pool.query(`
            SELECT SUM(cantidad * precio_unitario) AS total FROM items_turno WHERE id_turno = $1
        `, [id])
        const total = parseFloat(totalResult.rows[0].total)

        //4. Crear Factura

        const nroFactura = `0001-${String(id).padStart(8, '0')}`
        const facturaResult = await pool.query(`
            INSERT INTO facturas (nro_factura, id_turno, fecha, total)
            VALUES ($1, $2, CURRENT_DATE, $3)
            RETURNING id
        `, [nroFactura, id, total])

        //5. Crear comision

        await pool.query(`
         UPDATE empleados
         SET acumulado_semanal = acumulado_semanal + $1,
             acumulado_distribucion = acumulado_distribucion + $1
         WHERE id_usuario = $2
        `, [total, req.usuario?.id])

        //Actualizar el tiempo promedio del asesor
        await pool.query(`
            UPDATE empleados
            SET tiempo_promedio = (
              SELECT AVG(duracion_minutos)
              FROM turnos
              WHERE id_asesor = (SELECT id FROM empleados WHERE id_usuario = $1)
              AND estado = 'finalizado'
              AND duracion_minutos IS NOT NULL
              AND fecha >= DATE_TRUNC('week', CURRENT_DATE)
            )
            WHERE id_usuario = $1
        `, [req.usuario?.id])

        //actualizar el ultimo dia trabajado y dias trabajados semana
        await pool.query(`
            UPDATE empleados
            SET ultimo_dia_trabajado = CURRENT_DATE,
                dias_trabajados_semana = CASE
                 WHEN ultimo_dia_trabajado = CURRENT_DATE THEN dias_trabajados_semana
                 ELSE dias_trabajados_semana + 1
                END
            WHERE id_usuario = $1
        `, [req.usuario?.id])

        let vehiculoExistente = false;

        if(patente){
            //Buscar si ya existe un vehiculo_cliente con esa patente
            const vcExiste = await pool.query(`
                SELECT id FROM vehiculo_cliente WHERE patente = $1
            `, [patente])
            if(vcExiste.rows.length > 0){
                //vincular el turno al vehiculo_cliente existente
                vehiculoExistente = true
                const idVcExistente = vcExiste.rows[0].id

                await pool.query(`
                    UPDATE turnos SET id_vehiculo_cliente = $1 WHERE id = $2
                `, [idVcExistente, id])

                //actualizar km si se proporcionó
                if(vehiculo && vehiculo.km){
                    await pool.query(`
                        UPDATE vehiculo_cliente SET km = $1 WHERE id = $2
                    `, [parseInt(vehiculo.km), idVcExistente])
                }
            }else{
                //Guardar la patente en el vehiculo_cliente actual
                 await pool.query(`
                UPDATE vehiculo_cliente vc
                SET patente = $1
                FROM turnos t
                WHERE t.id = $2
                AND vc.id = t.id_vehiculo_cliente
            `, [patente, id])
            }
        }

        if( !vehiculoExistente && (vehiculo.marca || vehiculo.modelo)){
           const marcaNorm = (vehiculo.marca || '').trim().toUpperCase()
           const modeloNorm = (vehiculo.modelo || '').trim().toUpperCase()
           const versionNorm = (vehiculo.version || '').trim().toUpperCase()

           const modeloExiste = await pool.query(`
             SELECT id FROM vehiculos
             WHERE UPPER(marca) = $1 AND UPPER(modelo) = $2
            `, [marcaNorm, modeloNorm])

            if(modeloExiste.rows.length === 0){
             //crear vehiculo nuevo
             const nuevoVehiculo = await pool.query(`
                INSERT INTO vehiculos (marca, modelo, version)
                VALUES ($1, $2, $3) RETURNING id
             `, [marcaNorm, modeloNorm, versionNorm || null])
             //Vincularlo al vehiculo_cliente del turno
             await pool.query(`
                UPDATE vehiculo_cliente vc
                SET id_vehiculo = $1
                FROM turnos t
                WHERE t.id = $2
                AND vc.id = t.id_vehiculo_cliente
             `, [nuevoVehiculo.rows[0].id, id])
            }else{
                await pool.query(`
                    UPDATE vehiculo_cliente vc
                    SET id_vehiculo = $1
                    FROM turnos t
                    WHERE t.id = $2
                    AND vc.id = t.id_vehiculo_cliente
                `, [modeloExiste.rows[0].id, id])
            }
            await pool.query(`
                UPDATE vehiculo_cliente vc
                SET patente = COALESCE(NULLIF($1, ''), vc.patente),
                    nro_serie = COALESCE(NULLIF($2, ''), vc.nro_serie),
                    km = CASE WHEN $3 > 0 THEN $3 ELSE vc.km END
                FROM turnos t
                WHERE t.id = $4
                AND vc.id = t.id_vehiculo_cliente
            `, [patente || '', vehiculo.nro_serie || '', parseInt(vehiculo.km) || 0, id])
        }
        const monto = total * 0.01
        return res.json({ mensaje: 'Turno finalizado correctamente', total, comision: monto})
    }catch (err){
        console.error(err)
        return res.status(500).json({ mensaje: 'Error interno del servidor'})
    }
}

export async function  agregarItems(req: RequestConUsuario, res: Response) { //para modficar el turno después de haber finalizado
    const { id } = req.params
    const { items } = req.body

    if(!items || items.length === 0){
        return res.status(400).json({ mensaje: 'Debe cargar al menos un item'})
    }

    try{
        const turnoResult = await pool.query(`
            SELECT t.id FROM turnos t
            JOIN empleados e ON e.id = t.id_asesor
            WHERE t.id = $1
            AND e.id_usuario = $2
            AND t.estado = 'finalizado'
        `, [id, req.usuario?.id])

        if(turnoResult.rows.length === 0){
            return res.status(404).json({ mensaje: 'Turno no encontrado o no esta finalizado'})
        }

        //insertar nuevos items
        for(const item of items){
            await pool.query(`
                INSERT INTO items_turno (id_turno, descripcion, cantidad, precio_unitario, tipo) VALUES ($1, $2, $3, $4, $5)
            `, [id, item.descripcion, item.cantidad, item.precio_unitario, item.tipo])
        }

        //recalcular total
        const totalResult = await pool.query(`
            SELECT SUM(cantidad * precio_unitario) AS total FROM items_turno WHERE id_turno = $1
        `, [id])
        const total = parseFloat(totalResult.rows[0].total)

        //actualizar factura existente
        await pool.query(`
            UPDATE facturas SET total = $1 WHERE id_turno = $2
        `, [total, id])

        let nuevosItems = 0
        for(const item of items){
            nuevosItems += item.cantidad * item.precio_unitario
        }
        //actualizar el acumulado del asesor con el monto adicional
        await pool.query(`
            UPDATE empleados
            SET acumulado_semanal = acumulado_semanal + $1,
                acumulado_distribucion = acumulado_distribucion + $1
            WHERE id_usuario = $2
        `, [nuevosItems, req.usuario?.id])
        return res.json({ mensaje: 'items agregados correctamente', total})
    }catch(err){
        console.error(err)
        return res.status(500).json({ mensaje: 'Error interno del sevidor'})
    }
}