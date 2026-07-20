import { Router } from "express";
import { getTurnosHoy, getPanelAsesores, getHistorial } from "../controllers/encargadoController";
import { cargarTurno } from "../controllers/turnosController";
import { verificarToken, soloEncargado } from "../middlewares/authMiddleware";

const encargadoRouter = Router()

encargadoRouter.use(verificarToken)
encargadoRouter.use(soloEncargado)

encargadoRouter.get('/turnos/hoy', getTurnosHoy)
encargadoRouter.get('/asesores', getPanelAsesores)
encargadoRouter.get('/historial', getHistorial)
encargadoRouter.post('/turnos', cargarTurno)

export default encargadoRouter