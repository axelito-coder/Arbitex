import { Router as ExpressRouter } from "express";
import { getPerfil, getTurnosHoy, getTurnosSemana, iniciarAtencion } from "../controllers/asesorController";
import router from "./authRoutes";
import { soloAsesor, verificarToken } from "../middlewares/authMiddleware";
const asesorRouter = ExpressRouter()

asesorRouter.use(verificarToken)
asesorRouter.use(soloAsesor)

asesorRouter.get('/perfil', getPerfil)
asesorRouter.get('/turnos/hoy', getTurnosHoy)
asesorRouter.get('/tuenos/semana', getTurnosSemana)
asesorRouter.get('/turnos/:id/iniciar', iniciarAtencion)

export default router


