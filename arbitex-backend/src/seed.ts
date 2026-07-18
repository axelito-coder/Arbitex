import pool from './db'
import bcrypt from 'bcryptjs'

async function seed() {
  try {
    // Hashear contraseñas
    const passEncargado = await bcrypt.hash('admin123', 10)
    const passAsesor1   = await bcrypt.hash('asesor123', 10)
    const passAsesor2   = await bcrypt.hash('asesor123', 10)
    const passAsesor3   = await bcrypt.hash('asesor123', 10)
    const passAsesor4   = await bcrypt.hash('asesor123', 10)

    // Insertar encargado
    await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)',
      ['Encargado', 'encargado@arbitex.com', passEncargado, 'encargado']
    )

    // Insertar asesores
    const asesores = [
      ['Asesor A', 'asesora@arbitex.com', passAsesor1],
      ['Asesor B', 'asesorb@arbitex.com', passAsesor2],
      ['Asesor C', 'asesorc@arbitex.com', passAsesor3],
      ['Asesor D', 'asesord@arbitex.com', passAsesor4],
    ]

    for (const [nombre, email, password] of asesores) {
      const result = await pool.query(
        'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id',
        [nombre, email, password, 'asesor']
      )

      // Crear registro en empleados
      await pool.query(
        'INSERT INTO empleados (id_usuario) VALUES ($1)',
        [result.rows[0].id]
      )
    }

    // Insertar config inicial
    const fecha = new Date()
    const semana = Math.ceil((fecha.getDate() - fecha.getDay()) / 7)
    await pool.query(
      'INSERT INTO config (semana_activa, año_activo) VALUES ($1, $2)',
      [semana, fecha.getFullYear()]
    )

    console.log('Seed completado correctamente')
    process.exit(0)

  } catch (err) {
    console.error('Error en seed:', err)
    process.exit(1)
  }
}

seed()