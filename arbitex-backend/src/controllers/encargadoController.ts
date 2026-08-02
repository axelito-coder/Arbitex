import { Response } from 'express'
import pool from '../db'
import { RequestConUsuario } from '../middlewares/authMiddleware'


export async function  getDetalleTurno(req:RequestConUsuario, res: Response) {
    const { id } = req.params

    try{
        const turnoResult = await pool.query(`
            SELECT t.id, t.fecha, t.hora_carga, t.hora_inicio_atencion, t.hora_cierre_atencion,
              t.duracion_minutos, t.tipo_service, t.estado, t.es_compensacion,
              c.nombre AS cliente, c.cuit, c.telefono, c.condicion_iva,
              v.marca, v.modelo, v.version,
              vc.nro_serie, vc.km,
              u.nombre AS asesor,
              f.nro_factura, f.total,
              co.monto AS comision
            FROM turnos t
            JOIN vehiculo_cliente vc ON vc.id = t.id_vehiculo_cliente
            JOIN clientes c ON c.id = vc.id_cliente
            JOIN vehiculos v ON v.id = vc.id_vehiculo
            LEFT JOIN empleados e ON e.id = t.id_asesor
            LEFT JOIN usuarios u ON u.id = e.id_usuario
            LEFT JOIN facturas f ON f.id_turno = t.id
            LEFT JOIN comisiones co ON co.id_factura = f.id
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
            SELECT u.id AS id_usuario, u.nombre, u.email, e.acumulado_semanal, e.sesion_activa,
            e.tiempo_promedio, e.orden_compensacion,
            (e.acumulado_semanal * 0.01) AS comision,
            COUNT(t.id) FILTER (WHERE t.fecha = CURRENT_DATE) AS turnos_hoy,
            COUNT(t.id) FILTER (WHERE t.fecha = CURRENT_DATE AND t.estado = 'en_proceso') AS en_proceso
            FROM empleados e
            JOIN usuarios u ON u.id = e.id_usuario
            LEFT JOIN turnos t ON t.id_asesor = e.id
            GROUP BY u.id, u.nombre, u.email, e.acumulado_semanal, e.sesion_activa,
                     e.tiempo_promedio, e.orden_compensacion
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

//Cargar turno
export async function cargarTurno(req: RequestConUsuario, res: Response) {
  const { nombre_cliente, marca, modelo, version, nro_serie, km, tipo_service, horario } = req.body

  if (!nombre_cliente || !tipo_service) {
    return res.status(400).json({ mensaje: 'Faltan datos requeridos' })
  }

  let horarioCompleto = null
  if (horario) {
    const hoy = new Date().toISOString().split('T')[0]
    horarioCompleto = `${hoy} ${horario}:00`
  }

  try {
    // 1. Crear cliente
    const clienteResult = await pool.query(`
      INSERT INTO clientes (nombre) VALUES ($1) RETURNING id
    `, [nombre_cliente])
    const idCliente = clienteResult.rows[0].id

    // 2. Crear o buscar vehículo en el catálogo
    let idVehiculo
    const vehiculoExiste = await pool.query(`
      SELECT id FROM vehiculos WHERE marca = $1 AND modelo = $2 AND COALESCE(version, '') = $3
    `, [marca || 'Sin especificar', modelo || 'Sin especificar', version || ''])

    if (vehiculoExiste.rows.length > 0) {
      idVehiculo = vehiculoExiste.rows[0].id
    } else {
      const vehiculoResult = await pool.query(`
        INSERT INTO vehiculos (marca, modelo, version) VALUES ($1, $2, $3) RETURNING id
      `, [marca || 'Sin especificar', modelo || 'Sin especificar', version || null])
      idVehiculo = vehiculoResult.rows[0].id
    }

    // 3. Crear vehiculo_cliente
    const vcResult = await pool.query(`
      INSERT INTO vehiculo_cliente (id_vehiculo, id_cliente, nro_serie, km)
      VALUES ($1, $2, $3, $4) RETURNING id
    `, [idVehiculo, idCliente, nro_serie || null, km || null])
    const idVehiculoCliente = vcResult.rows[0].id

    // 4. Crear turno
    const result = await pool.query(`
      INSERT INTO turnos (id_vehiculo_cliente, tipo_service, horario, estado, fecha)
      VALUES ($1, $2, $3, 'pendiente', CURRENT_DATE)
      RETURNING *
    `, [idVehiculoCliente, tipo_service, horarioCompleto])

    return res.status(201).json(result.rows[0])

  } catch (err) {
    console.error(err)
    return res.status(500).json({ mensaje: 'Error interno del servidor' })
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