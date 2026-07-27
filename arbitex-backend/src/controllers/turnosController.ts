import { Response } from 'express'
import pool from '../db'
import { RequestConUsuario } from '../middlewares/authMiddleware'
//FUNCIONES AUXILIARES

function getNumeroSemana(fecha: Date): number { //Obtenemos el numero de la semana para despues verificar el nuevo inicio de semana
    const inicio = new Date(fecha.getFullYear(), 0, 1)
    const dias = Math.floor((fecha.getTime() - inicio.getTime()) / (24 * 60 * 60 * 1000))
    return Math.ceil((dias + inicio.getDay() + 1) / 7)
}

async function verificarNuevaSemana(): Promise<boolean> { //verificamos que sea una nueva semana, por eso promise<boolean>
  try {
    const fecha = new Date() //fecha actual
    const semanaActual = getNumeroSemana(fecha) //semenaActual
    const añoActual = fecha.getFullYear() //año actual

    console.log('semanaActual:', semanaActual) 
    console.log('añoActual:', añoActual)

    const result = await pool.query(
      'SELECT semana_activa, año_activo FROM config WHERE id = 1' //se trae la fecha guardada por ultima vez en la base de datos
    )

    console.log('config result:', result.rows)

    const config = result.rows[0]
    console.log('config:', config)
    console.log('esNuevaSemana:', config.semana_activa !== semanaActual || config.año_activo !== añoActual)

    return config.semana_activa !== semanaActual || config.año_activo !== añoActual //si no es la misma semana, true, si se cambio de año, tambien.
  } catch (err) {
    console.error('Error en verificarNuevaSemana:', err)
    return false
  }
}

async function  guardarSemanaActiva(): Promise<void> { //como no devolvemos nada en estas funciones, son void
    const fecha = new Date()  
    await pool.query(
        'UPDATE config SET semana_activa = $1, año_activo = $2 WHERE id = 1',
        [getNumeroSemana(fecha), fecha.getFullYear()]
    ) //Se guarda la semana en el inicio de la semana
}

async function  aplicarCompensacionSemanal(): Promise<void> {
    //Una vez que empieza la semana nueva, se ordena a los asesores por lo facturado la semana anterior
    //asi determinamos el orden de los primeros N (cantidad se asesores) turnos al inicio de la semana
    await pool.query(`
        UPDATE empleados
        SET acumulado_semana_anterior = acumulado_semanal,
        acumulado_semanal = 0
    `)

    const result = await pool.query(`
        SELECT id FROM empleados
        ORDER BY acumulado_semana_anterior ASC
    `)

    for (let i = 0; i < result.rows.length; i++){
        await pool.query(
            'UPDATE empleados SET orden_compensacion = $1 WHERE id = $2',
            [i + 1, result.rows[i].id]
        )
    }
}

async function contarTurnosHoy(): Promise<number> { //para verificar que no sea una semana nueva se verifica que no haya turnos del mismo dia
    const result = await pool.query(
        `SELECT COUNT(*) FROM turnos
         WHERE fecha = CURRENT_DATE
         AND estado != 'pendiente'
        `
    )
    return parseInt(result.rows[0].count)
}

async function contarAsesores(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) FROM empleados')
    return parseInt(result.rows[0].count)
}

async function  estaDisponible(idAsesor:number): Promise<boolean> { //verificamos si el asesor esta disponible o no con true o false
    const ocupado = await pool.query(`
        SELECT id FROM turnos
        WHERE id_asesor = $1
        AND estado IN ('en_proceso', 'asignado')
        AND fecha = CURRENT_DATE
    `, [idAsesor])

    return ocupado.rows.length === 0
}

async function  notificarEncargado(idTurno: number): Promise<void> { 
    await pool.query(`
        UPDATE turnos SET estado = 'pendiente' WHERE id = $1
    `, [idTurno])
    console.log(`Turno ${idTurno} sin asesores disponibles --Notificando al encargado`) //simplemente es para revisar que funcione la lógica , nada más, por eso void
}

async function asignarPorCompensacion(idTurno: number, turnosHoy: number): Promise<void> { //
    const result = await pool.query(`
        SELECT id FROM empleados
        WHERE sesion_activa = true
        ORDER BY orden_compensacion ASC
        LIMIT 1 OFFSET $1
    `, [turnosHoy]) //traemos al primer asesor ordenado por orden de compensacion, salteandose segun la cantidad de turnos que van en el lunes 

    if(result.rows.length === 0){
        await notificarEncargado(idTurno)
        return
    }

    await pool.query(`
        UPDATE turnos
        SET id_asesor = $1, estado = 'en_proceso', es_compensacion = true,
        hora_inicio_atencion = NOW() WHERE id = $2
    `, [result.rows[0].id, idTurno]) //se le asigna el turno al asesor y se determina si el turno es de compensacion
}

async function asignarTurno(idTurno: number): Promise<void> { //funcion principal para asignar turnos
    const asesores = await pool.query(` 
        SELECT id FROM empleados WHERE sesion_activa = true
    `)//traemos los asesores

    const disponibles: number[] = []
    for (const asesor of asesores.rows){
        if (await estaDisponible(asesor.id)){
            disponibles.push(asesor.id)
        }
    }//filtramos los disponibles

    if (disponibles.length === 0){
        await notificarEncargado(idTurno)
        setTimeout(() => asignarTurno(idTurno), 5 * 60 * 1000)
        return
    }//si no hay asesores ese momento, se reintenta cada 5 minutos

    const result = await pool.query(`
        SELECT e.id
        FROM empleados e
        LEFT JOIN turnos t ON t.id_asesor = e.id AND t.fecha = CURRENT_DATE
        WHERE e.id = ANY($1)
        GROUP BY e.id, e.acumulado_semanal, e.orden_compensacion
        ORDER BY e.acumulado_semanal ASC,
                COUNT(t.id) ASC,
                e.orden_compensacion ASC
        LIMIT 1
    `, [disponibles])

    await pool.query(`
        UPDATE turnos
        SET id_asesor = $1, estado = 'en_proceso',
        hora_inicio_atencion = NOW()
        WHERE id = $2
    `, [result.rows[0].id, idTurno])

    //Actualizar acumulado del asesor
    await pool.query(`
        UPDATE empleados e
        SET acumulado_semanal = acumulado_semanal + (
          SELECT COALESCE(SUM(f.total), 0)
          FROM facturas f
          JOIN turnos t ON t.id = f.id_turno
          WHERE t.id = $1
        )
        WHERE e.id = $2
    `, [idTurno, result.rows[0].id])
}

export async function cargarTurno(req: RequestConUsuario, res: Response) {
    console.log('cargarTurno llamado', req.body)  // ← acá
    const { nombre_cliente, marca, modelo, version, nro_serie, km, tipo_service} = req.body //se obtiene la informacion del turno desde el front

    if(!nombre_cliente || !tipo_service){
        return res.status(400).json({ mensaje: 'Faltan datos requeridos'}) //si hay error en el front
    }

    try {
    // 1. Crear cliente
    const clienteResult = await pool.query(`
      INSERT INTO clientes (nombre) VALUES ($1) RETURNING id
    `, [nombre_cliente])
    const idCliente = clienteResult.rows[0].id

    // 2. Crear o buscar vehículo
    let idVehiculo
    const vehiculoExiste = await pool.query(`
      SELECT id FROM vehiculos
      WHERE marca = $1 AND modelo = $2 AND COALESCE(version, '') = $3
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

    // 4. Insertar turno en pendiente
    const turnoResult = await pool.query(`
      INSERT INTO turnos (id_vehiculo_cliente, tipo_service, estado, fecha)
      VALUES ($1, $2, 'pendiente', CURRENT_DATE)
      RETURNING id
    `, [idVehiculoCliente, tipo_service])
    const idTurno = turnoResult.rows[0].id

    // 5. Lógica de distribución
    const esNuevaSemana = await verificarNuevaSemana()
    const turnosHoy = await contarTurnosHoy()
    const cantidadAsesores = await contarAsesores()

    console.log('esNuevaSemana:', esNuevaSemana)
    console.log('turnosHoy:', turnosHoy) 

    //verificar inicio de semana
    if (esNuevaSemana && turnosHoy === 0) {
        console.log('Ejecutando respaldo...')
      await aplicarCompensacionSemanal()
      await guardarSemanaActiva()
    }

    //si ademas de nueva semana cuantos turnos de compensacion van
    if (esNuevaSemana && turnosHoy < cantidadAsesores) {
      await asignarPorCompensacion(idTurno, turnosHoy)
    } else {
      await asignarTurno(idTurno)
    }

    return res.status(201).json({ mensaje: 'Turno cargado correctamente', id: idTurno })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ mensaje: 'Error interno del servidor' })
  }
}
