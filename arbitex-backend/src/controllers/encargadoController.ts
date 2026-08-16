import { Response } from 'express'
import pool from '../db'
import { RequestConUsuario } from '../middlewares/authMiddleware'

export async function  getConfig(req: RequestConUsuario, res: Response) {
  try{
    const result = await pool.query('SELECT presupuesto_bonus, presupuesto_usado FROM config WHERE id = 1')
    return res.json(result.rows[0])
  }catch (err){
    console.error(err)
    return res.status(500).json({mensaje: 'Error interno del servidor'})
  }
}

export async function getVehiculosFrecuentes(req: RequestConUsuario, res: Response) { //endpoint para que los chicos hagan vista de estaditicas de autos y clientes
  try{//Se tae los datos de los vehiculos que vienen a la concesionaria ordenados segun la cantidad de veces que fueron segun su patente, también los datos del cliente
   
    const result = await pool.query(` 
      SELECT vc.patente, v.marca, v.modelo, v.version,
             MAX(c.nombre) AS cliente, MAX(c.telefono) AS telefono, MAX(c.email) AS email,
             COUNT(t.id) AS visitas,
             MAX(t.fecha) AS ultimo_service,
             COALESCE(SUM(f.total), 0) AS total_facturado
      FROM vehiculo_cliente vc
      JOIN vehiculos v ON v.id = vc.id_vehiculo
      JOIN clientes c ON c.id = vc.id_cliente
      JOIN turnos t ON t.id_vehiculo_cliente = vc.id
      LEFT JOIN facturas f ON f.id_turno = t.id
      WHERE t.estado = 'finalizado'
      GROUP BY vc.id, vc.patente, v.marca, v.modelo, v.version
      ORDER BY visitas DESC
    `)
    return res.json(result.rows) 
  }catch(err){
    console.error(err)
    return res.status(500).json({mensaje: 'Error interno en el servidor'})
  }
}
export async function  getDetalleTurno(req:RequestConUsuario, res: Response) { //Para traer toda la información de un turno
    const { id } = req.params
    try{
        const turnoResult = await pool.query(`
            SELECT t.id, t.fecha, t.hora_carga, t.hora_inicio_atencion, t.hora_cierre_atencion,
              t.duracion_minutos, t.tipo_service, t.estado, t.es_compensacion,
              c.nombre AS cliente, c.telefono,
              v.marca, v.modelo, v.version,
              vc.nro_serie, vc.km,
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
        //por separado traemos los items del turno
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

// Obtener todos los turnos del día
export async function getTurnosHoy(req: RequestConUsuario, res: Response) {
  try {
    const result = await pool.query(`
      SELECT t.id, t.hora_carga, t.tipo_service, t.estado, t.es_compensacion,
       c.nombre AS cliente,
       v.marca || ' ' || v.modelo || ' ' || COALESCE(v.version, '') AS vehiculo,
       u.nombre AS asesor,
       CASE
        WHEN t.estado = 'finalizado' THEN t.duracion_minutos
        WHEN t.estado = 'en_proceso' AND t.hora_inicio_atencion IS NOT NULL
        THEN EXTRACT(EPOCH FROM(NOW() - t.hora_inicio_atencion)) / 60
        ELSE NULL
        END as duracion
      FROM turnos t
      JOIN vehiculo_cliente vc ON vc.id = t.id_vehiculo_cliente
      JOIN clientes c ON c.id = vc.id_cliente
      JOIN vehiculos v ON v.id = vc.id_vehiculo
      LEFT JOIN empleados e ON e.id = t.id_asesor
      LEFT JOIN usuarios u ON u.id = e.id_usuario
      WHERE t.fecha = CURRENT_DATE
      ORDER BY t.hora_carga ASC NULLS LAST
    `)

    return res.json(result.rows)

  } catch (err) {
    console.error(err)
    return res.status(500).json({ mensaje: 'Error interno del servidor' })
  }
}

//obtener panel de asesores
export async function  getPanelAsesores(req: RequestConUsuario, res: Response) {
    try{
        const result = await pool.query(`
            SELECT u.id AS id_usuario, u.nombre, u.email, e.acumulado_semanal, e.acumulado_distribucion, e.sesion_activa,
            e.tiempo_promedio, e.orden_compensacion, e.dias_trabajados_semana,
            (e.acumulado_semanal * 0.01) AS comision,
            e.bonus_semana,
            COUNT(t.id) FILTER (WHERE t.fecha = CURRENT_DATE) AS turnos_hoy,
            COUNT(t.id) FILTER (WHERE t.fecha = CURRENT_DATE AND t.estado = 'en_proceso') AS en_proceso
            FROM empleados e
            JOIN usuarios u ON u.id = e.id_usuario
            LEFT JOIN turnos t ON t.id_asesor = e.id
            GROUP BY u.id, u.nombre, u.email, e.acumulado_semanal, e.acumulado_distribucion, e.sesion_activa,
                     e.tiempo_promedio, e.orden_compensacion, e.dias_trabajados_semana, e.bonus_semana
            ORDER BY e.acumulado_semanal ASC    
        `)

        return res.json(result.rows)
    }catch (err){
        console.error(err)
        return res.status(500).json({ mensaje: 'Error interno del servidor'})
    }
    
}

//Obtener historial semanal

export async function  getHistorial(req: RequestConUsuario, res: Response) {
    try{
        const result = await pool.query(`
            SELECT t.id, t.fecha, t.tipo_service, t.estado,
            t.es_compensacion,
            c.nombre AS cliente,
            v.marca || ' ' || v.modelo AS vehiculo,
            u.nombre AS asesor,
            CASE
              WHEN t.estado = 'finalizado' THEN t.duracion_minutos
              ELSE NULL
              END AS duracion
            FROM turnos t
            JOIN vehiculo_cliente vc ON vc.id = t.id_vehiculo_cliente
            JOIN clientes c ON c.id = vc.id_cliente
            JOIN vehiculos v ON v.id = vc.id_vehiculo
            LEFT JOIN empleados e ON e.id = t.id_asesor
            LEFT JOIN usuarios u ON u.id = e.id_usuario
            WHERE t.fecha >= DATE_TRUNC('week', CURRENT_DATE)
            AND t.fecha < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
            ORDER BY t.fecha ASC, t.hora_carga ASC NULLS LAST
        `)

        return res.json(result.rows)
    }catch(err){
        console.error(err)
        return res.status(500).json({ mensaje: 'Error interno del servidor'})
    }
}




//Crear asesor
export async function  crearAsesor(req: RequestConUsuario, res: Response) {
  const { nombre, email, password } = req.body

  if(!nombre || !email || !password){
    return res.status(400).json({ mensaje: 'Faltan datos requeridos' })
  }

  try{
    const bcrypt = require('bcryptjs')
    const hash = await bcrypt.hash(password, 10)

    const existe = await pool.query(`
      SELECT id FROM usuarios WHERE email = $1
    `, [email])
    if(existe.rows.length > 0){
      return res.status(400).json({ mensaje: 'El email ya esta en uso' })
    }

    const result = await pool.query(`
      INSERT INTO usuarios (nombre, email, password, rol)
      VALUES ($1, $2, $3, 'asesor')
      RETURNING id
    `, [nombre, email, hash])

    await pool.query(`
      INSERT INTO empleados (id_usuario)
      VALUES ($1)
    `, [result.rows[0].id])
    //como en la base de datos, asesor tiene valores default para los acumulados no hay problema de null
    //el orden de compensacion nuevo se recalcula el lunes que viene, el null de ese campo no afecta si empieza otro dia.
    return res.status(201).json({ mensaje: 'Asesor creado correctamente' })
  }catch(err){
    console.error(err)
    return res.status(500).json({ mensaje: 'Error interno del servidor' })
  }
}

export async function editarAsesor(req: RequestConUsuario, res: Response) {
  const { id } = req.params
  const { nombre, email, password } = req.body
  console.log('editarAsesor id:', id, 'body:', req.body)
  try{
    const existe = await pool.query(`
      SELECT id FROM usuarios WHERE email = $1 AND id != $2
    `, [email, id])
    if(existe.rows.length > 0){
      return res.status(400).json({ mensaje: 'El email ya esta en uso' })
    }
    await pool.query(`
      UPDATE usuarios SET nombre = $1, email = $2 WHERE id = $3
    `, [nombre, email, id])

    if(password){
      const bcrypt = require('bcryptjs')
      const hash = await bcrypt.hash(password, 10)
      await pool.query(`
        UPDATE usuarios SET password = $1 WHERE id = $2
      `, [hash, id])
    }
    return res.json({ mensaje: 'Asesor actualizado correctamente'})
  }catch(err){
    console.error(err)
    return res.status(500).json({ mensaje: 'Error interno del servidor'})
  }
}

export async function  desactivarAsesor(req: RequestConUsuario, res: Response) {
  const { id } = req.params

  try{
    await pool.query(`
      UPDATE empleados SET sesion_activa = false
      WHERE id_usuario = $1
    `, [id])
    return res.json({ mensaje: 'Asesor desactivado correctamente'})
  }catch(err){
    console.error(err)
    return res.status(500).json({ mensaje: 'Error interno del servidor' })
  }
}

export async function darBonus(req: RequestConUsuario, res: Response) {
  const { id } = req.params
  const { monto } = req.body
  if(!monto || monto <= 0){
    return res.status(400).json({ mensaje: 'El monto debe ser mayor a 0'})
  }
  try{
    //Verificar presupuesto disponible
    const configResult = await pool.query(`
      SELECT presupuesto_bonus, presupuesto_usado FROM config WHERE id = 1
    `)
    const config = configResult.rows[0]
    const disponible = parseFloat(config.presupuesto_bonus) - parseFloat(config.presupuesto_usado)
    if(monto > disponible){
      return res.status(400).json({
        mensaje: `Presupuesto insuficiente. Disponible: $${disponible.toLocaleString('es-AR')}`
      })
    }

    //aplicar bonus
    await pool.query(`
      UPDATE empleados
      SET bonus_semana = bonus_semana + $1
      WHERE id_usuario = $2
    `, [monto, id])

    //actualizar presupuesto semanal
    await pool.query(`
      UPDATE config SET presupuesto_usado = presupuesto_usado + $1 WHERE id = 1
    `, [monto])

    return res.json({mensaje: 'Bonus aplicado correctamente'})
  }catch(err){
    console.error(err)
    return res.status(500).json({ mensaje: 'Error intero del servidor'})
  }
}