import { Router } from "express";
import { getTurnosHoy, getPanelAsesores, getHistorial, getDetalleTurno, crearAsesor, editarAsesor, desactivarAsesor, darDeBajaAsesor, darBonus, getConfig, getVehiculosFrecuentes, getClientes, getClienteDetalle, getTurnosPorHora } from "../controllers/encargadoController";
import { cargarTurno } from "../controllers/turnosController";
import { verificarToken, soloEncargado, soloRecepcion } from "../middlewares/authMiddleware";



//----Recepcion(encargado + recepcionista)
const recepcionRouter = Router()
recepcionRouter.use(verificarToken)
recepcionRouter.use(soloRecepcion)


recepcionRouter.get('/turnos/hoy', getTurnosHoy)
recepcionRouter.get('/turnos/:id/detalle', getDetalleTurno)
recepcionRouter.post('/turnos', cargarTurno)


//----Encargado----

const encargadoRouter = Router()

encargadoRouter.use(verificarToken)
encargadoRouter.use(soloEncargado)


encargadoRouter.get('/asesores', getPanelAsesores)
encargadoRouter.get('/turnos/por-hora', getTurnosPorHora)
encargadoRouter.get('/historial', getHistorial)
encargadoRouter.get('/config', getConfig)
encargadoRouter.get('/vehiculos/frecuentes', getVehiculosFrecuentes)
encargadoRouter.get('/clientes', getClientes)
encargadoRouter.get('/clientes/:dni', getClienteDetalle)
encargadoRouter.post('/asesores', crearAsesor)
encargadoRouter.post('/asesores/:id/bonus', darBonus)
encargadoRouter.put('/asesores/:id', editarAsesor)
encargadoRouter.put('/asesores/:id/desactivar', desactivarAsesor)
encargadoRouter.put('/asesores/:id/baja', darDeBajaAsesor)

export {encargadoRouter, recepcionRouter}