import { Request, Response } from 'express'
import pool from '../db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function login(req: Request, res: Response){
    const { email, password } = req.body

    if(!email || !password){
        return res.status(400).json({ mensaje: 'Email y contraseña requeridos'})
    }

    try{
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        )

        if(result.rows.length === 0){
            return res.status(401).json({ mensaje: 'Credenciales incorrectas'})
        }

        const usuario = result. rows[0]

        //verificar contraseña
        const passwordValida = await bcrypt.compare(password, usuario.password)

        if(!passwordValida){
            return res.status(401).json({ mensaje: 'Credenciales incorrectas'})
        }

        // Si es asesor, activar sesion_activa
       if (usuario.rol === 'asesor') {
         await pool.query(`
         UPDATE empleados
         SET sesion_activa = true
         WHERE id_usuario = $1
        `, [usuario.id])
}

        //Generar token JWT
        const token = jwt.sign(
            {id: usuario.id, rol: usuario.rol},
            process.env. JWT_SECRET as string,
            { expiresIn: '8h' }
        )

        return res.json({
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                rol: usuario.rol,
            }
        })
    }catch (err) {
        console.error(err)
        return res.status(500).json({ mensaje: 'Error interno del servidor'})
    }
}