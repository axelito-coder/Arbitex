import { Response } from 'express'
import pool from '../db'
import { RequestConUsuario } from '../middlewares/authMiddleware'
//FUNCIONES AUXILIARES

function getNumeroSemana(fecha: Date): number { //Obtenemos el numero de la semana para despues verificar el nuevo inicio de semana
    const lunes = new Date(fecha)
    const dia = fecha.getDay()
    const diff = dia === 0 ? -6 : 1 -dia //Si es domingo resta 6, sino resta lo que falta para lunes
    lunes.setDate(fecha.getDate() + diff)
    lunes.setHours(0, 0, 0, 0)

    //Número de semana basado en el lunes y tambien el primer jueves del año
    const jueves = new Date(lunes)
    jueves.setDate(lunes.getDate() + 3)
    const inicioAnio = new Date(jueves.getFullYear(), 0, 1)
    const diff2 = jueves.getTime() - inicioAnio.getTime()
    return Math.ceil((diff2 / 86400000 + inicioAnio.getDay() + 1) / 7)
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
            acumulado_semanal = 0,
            acumulado_distribucion = 0,
            dias_trabajados_semana = 0,
            bonus_disponible = false,
            bonus_maximo = 0,
            bonus_semana = 0
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

    const totalSemanaResult = await pool.query(`
        SELECT COALESCE(SUM(acumulado_semana_anterior), 0) AS total FROM empleados
    `)
    const totalSemana = parseFloat(totalSemanaResult.rows[0].total)
    const presupuesoBonus = totalSemana * 0.005
    await pool.query(`
        UPDATE config
        SET presupuesto_bonus = $1,
            presupuesto_usado = 0
        WHERE id = 1
    `, [presupuesoBonus])

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

async function cerrarTurnosPendientes(): Promise<void> {
    await pool.query(`
        UPDATE turnos
        SET estado = 'finalizado',
           hora_cierre_atencion = NOW(),
           duracion_minutos = EXTRACT(EPOCH FROM (NOW() - hora_inicio_atencion)) / 60
        WHERE estado = 'en_proceso'
        AND fecha < CURRENT_DATE
    `)
    console.log('Turnos en proceso anteriores cerrados')
}

async function aplicarAcumuladoFicticio(): Promise<void> {
    //obtener el ultimo dia de actividad 
    const ultimoDiaResult = await pool.query(`
        SELECT MAX(fecha) AS ultimo_dia FROM turnos WHERE fecha < CURRENT_DATE
    `)
    const ultimoDia = ultimoDiaResult.rows[0].ultimo_dia
    if(!ultimoDia) return

    //obtener asesores que no trabajaron el ultimo dia
    const ausentes = await pool.query(`
        SELECT id, acumulado_distribucion FROM empleados
        WHERE ultimo_dia_trabajado < $1
        OR ultimo_dia_trabajado IS NULL
    `, [ultimoDia])

    if(ausentes.rows.length === 0) return

    //calcular mediana del equipo en ese ultimo dia
    const promedioResult = await pool.query(`
        SELECT COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_dia), 0) AS promedio
        FROM (
           SELECT e.id, COALESCE(SUM(f.total), 0) AS total_dia
           FROM empleados e
           JOIN turnos t ON t.id_asesor = e.id
           JOIN facturas f ON f.id_turno = t.id
           WHERE e.ultimo_dia_trabajado = $1
           AND t.fecha = $1
           GROUP BY e.id
        ) AS totales_dia
    `, [ultimoDia])

    const promedio = parseFloat(promedioResult.rows[0].promedio)

    if(promedio === 0) return

    //sumar el promedio como ficticio a los que faltaron
    //esto se usa para equilibrar el sistema de asignacion, sin sumarle comision alguna a los asesores que faltan y evitando que se ocupen todos los turnos al dia siguiente
    //el acumulado semanal mientras tanto es con el que los aseores facturan su comision y es verdaderamente lo que le dan a la empresa
    //acumulado distribucion es para evitar irregularidades que beneficien injustamente a los que faltan algunos días y afecten el rendimiento de los mejores asesores
    for (const asesor of ausentes.rows){
        await pool.query(`
            UPDATE empleados
            SET acumulado_distribucion = acumulado_distribucion + $1
            WHERE id = $2
        `, [promedio, asesor.id])
    }

    //hacemos lo de acumulado fictio para que la diferencia de montos al siguiente dia no sea tan grande
    //y la gente que si trabajo el dia anterior no pierda todos los turnos del dia siguiente
    //junto con los beneficios disponibles que puede dar el encargado, se resuelve este problema
    console.log(`Acumulado ficticio aplicado $${promedio} a ${ausentes.rows.length}`)

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
        GROUP BY e.id, e.acumulado_distribucion, e.orden_compensacion
        ORDER BY e.acumulado_distribucion ASC,
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
        ),
        acumulado_distribucion = acumulado_distribucion + (
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
    const { nombre_cliente, email, telefono, dni ,tipo_service} = req.body //se obtiene la informacion del turno desde el front

    if(!nombre_cliente || !tipo_service){
        return res.status(400).json({ mensaje: 'Faltan datos requeridos'}) //si hay error en el front
    }

    try {
    // 1. Buscar o crear cliente por DNI
    let idCliente: number
    const clienteExiste = await pool.query(`
      SELECT id FROM clientes WHERE dni = $1
    `, [dni])

    if (clienteExiste.rows.length > 0) {
      idCliente = clienteExiste.rows[0].id
      await pool.query(`
        UPDATE clientes
        SET nombre = $1,
            email = COALESCE(NULLIF($2, ''), email),
            telefono = COALESCE(NULLIF($3, ''), telefono)
        WHERE id = $4
       `, [nombre_cliente, email || '', telefono || '', idCliente]) //se modifica los datos si cambiaron el nombre, email o teléfono
    } else {//si es cliente nuevo
      const clienteResult = await pool.query(`
        INSERT INTO clientes (nombre, email, telefono, dni) VALUES ($1, $2, $3, $4) RETURNING id
      `, [nombre_cliente, email || null, telefono || null, dni])
      idCliente = clienteResult.rows[0].id
    }
    // 2. Crear o buscar vehículo
    const vehiculoResult = await pool.query(`
        INSERT INTO vehiculos (marca, modelo) VALUES ('Sin especificar', 'Sin especificar') RETURNING id
      `,)
    const idVehiculo = vehiculoResult.rows[0].id
    

    const vcResult = await pool.query(`
        INSERT INTO vehiculo_cliente (id_vehiculo, id_cliente)
        VALUES ($1, $2) RETURNING id
    `, [idVehiculo, idCliente])

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

    //cuando empieza el día
    if(turnosHoy === 0){
        await cerrarTurnosPendientes()
        await aplicarAcumuladoFicticio()
    }
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
