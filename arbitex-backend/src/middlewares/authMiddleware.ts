import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface RequestConUsuario extends Request {
  usuario?: {
    id: number
    rol: string
  }
}

export function verificarToken(req: RequestConUsuario, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Token requerido' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number, rol: string }
    req.usuario = decoded
    next()
  } catch {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' })
  }
}

export function soloEncargado(req: RequestConUsuario, res: Response, next: NextFunction) {
  if (req.usuario?.rol !== 'encargado') {
    return res.status(403).json({ mensaje: 'Acceso denegado' })
  }
  next()
}

export function soloAsesor(req: RequestConUsuario, res: Response, next: NextFunction) {
  if (req.usuario?.rol !== 'asesor') {
    return res.status(403).json({ mensaje: 'Acceso denegado' })
  }
  next()
}