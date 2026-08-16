import { Router } from "express";
import { getTurnosHoy, getPanelAsesores, getHistorial, getDetalleTurno, crearAsesor, editarAsesor, desactivarAsesor, darBonus, getConfig, getVehiculosFrecuentes, getClientes, getClienteDetalle } from "../controllers/encargadoController";
import { cargarTurno } from "../controllers/turnosController";
import { verificarToken, soloEncargado } from "../middlewares/authMiddleware";

const encargadoRouter = Router()

encargadoRouter.use(verificarToken)
encargadoRouter.use(soloEncargado)

encargadoRouter.get('/turnos/:id/detalle', getDetalleTurno)
encargadoRouter.get('/turnos/hoy', getTurnosHoy)
encargadoRouter.get('/asesores', getPanelAsesores)
encargadoRouter.get('/historial', getHistorial)
encargadoRouter.get('/config', getConfig)
encargadoRouter.get('/vehiculos/frecuentes', getVehiculosFrecuentes)
encargadoRouter.get('/clientes', getClientes)
encargadoRouter.get('/clientes/:dni', getClienteDetalle)
encargadoRouter.post('/turnos', cargarTurno)
encargadoRouter.post('/asesores', crearAsesor)
encargadoRouter.post('/asesores/:id/bonus', darBonus)
encargadoRouter.put('/asesores/:id', editarAsesor)
encargadoRouter.put('/asesores/:id/desactivar', desactivarAsesor)

export default encargadoRouter