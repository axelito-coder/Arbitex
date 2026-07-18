import { Response } from 'express'
import pool from '../db'
import { RequestConUsuario } from '../middlewares/authMiddleware'

// Obtener todos los turnos del día
export async function getTurnosHoy(req: RequestConUsuario, res: Response) {
  try {
    const result = await pool.query(`
      SELECT t.id, t.horario, t.tipo_service, t.estado, t.es_compensacion,
             c.nombre AS cliente,
             v.marca || ' ' || v.modelo || ' ' || COALESCE(v.version, '') AS vehiculo,
             u.nombre AS asesor
      FROM turnos t
      JOIN vehiculo_cliente vc ON vc.id = t.id_vehiculo_cliente
      JOIN clientes c ON c.id = vc.id_cliente
      JOIN vehiculos v ON v.id = vc.id_vehiculo
      LEFT JOIN empleados e ON e.id = t.id_asesor
      LEFT JOIN usuarios u ON u.id = e.id_usuario
      WHERE t.fecha = CURRENT_DATE
      ORDER BY t.horario ASC NULLS LAST
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
            SELECT u.nombre, e.acumulado_semanal, e.sesion_activa,
            e.tiempo_promedio, e.orden_compensacion,
            (e.acumulado_semanal * 0.01) AS comision,
            COUNT(t.id) FILTER (WHERE t.fecha = CURRENT_DATE) AS turnos_hoy,
            COUNT(t.id) FILTER (WHERE t.fecha = CURRENT_DATE AND t.estado = 'en_proceso') AS en_proceso
            FROM empleados e
            JOIN usuarios u ON u.id = e.id_usuario
            LEFT JOIN turnos t ON t.id_asesor = e.id
            GROUP BY u.nombre, e.acumulado_semanal, e.sesion_activa,
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
            SELECT t.id, t.fecha, t.horario, t.tipo_service, t.estado,
            t.duracion_minutos, t.es_compensacion,
            c.nombre AS cliente,
            v.marca || ' ' || v.modelo AS vehiculo,
            u.nombre AS asesor
            FROM turnos t
            JOIN vehiculo_cliente vc ON vc.id = t.id_vehiculo_cliente
            JOIN clientes c ON c.id = vc.id_cliente
            JOIN vehiculos v ON v.id = vc.id_vehiculo
            LEFT JOIN empleados e ON e.id = t.id_asesor
            LEFT JOIN usuarios u ON u.id = e.id_usuario
            WHERE t.fecha >= DATE_TRUNC('week', CURRENT_DATE)
            AND t.fecha < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
            ORDER BY t.fecha ASC, t.horario ASC NULLS LAST
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