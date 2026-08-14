import { Router as ExpressRouter } from "express";
import { getPerfil, getTurnosHoy, getTurnosSemana, iniciarAtencion, finalizarTurno,  getDetalleTurno, agregarItems} from "../controllers/asesorController";
import { soloAsesor, verificarToken } from "../middlewares/authMiddleware";
const asesorRouter = ExpressRouter()

asesorRouter.use(verificarToken)
asesorRouter.use(soloAsesor)

asesorRouter.get('/turnos/:id/detalle', getDetalleTurno)
asesorRouter.get('/perfil', getPerfil)
asesorRouter.get('/turnos/hoy', getTurnosHoy)
asesorRouter.get('/turnos/semana', getTurnosSemana)
asesorRouter.put('/turnos/:id/iniciar', iniciarAtencion)
asesorRouter.put('/turnos/:id/finalizar', finalizarTurno)
asesorRouter.post('/turnos/:id/items', agregarItems)

export default asesorRouter


