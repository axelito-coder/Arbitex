import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Dashboard from './pages/encargado/Dashboard'
import CargarTurno from './pages/encargado/CargarTurno'
import Inicio from './pages/asesor/Inicio'
import MisTurnos from './pages/asesor/MisTurnos'
import MiPerfil from './pages/asesor/MiPerfil'
import PanelAsesores from './pages/encargado/PanelAsesores'
import Historial from './pages/encargado/Historial'
import Login from './pages/Login'
import './App.css'
import GestionAsesores from './pages/encargado/GestionAsesores'
import VehiculosFrecuentes from './pages/encargado/VehiculosFrecuentes'
import Clientes from './pages/encargado/Clientes'

function App() {
  const [sidebar, setSidebar] = useState(true)
  const [rol, setRol]         = useState(localStorage.getItem('rol') || '')
  const [pagina, setPagina]   = useState(
    localStorage.getItem('rol') === 'encargado' ? 'dashboard' : 'inicio'
  )
  const [tema, setTema]       = useState(localStorage.getItem('tema') || 'claro')

  useEffect(() => {
    document.documentElement.setAttribute('data-tema', tema)
    localStorage.setItem('tema', tema)
  }, [tema])

  if (!rol) {
    return (
      <Login
        onLogin={(rolUsuario: string) => {
          setRol(rolUsuario)
          setPagina(rolUsuario === 'encargado' ? 'dashboard' : 'inicio')
        }}
      />
    )
  }

  return (
    <div className="app-contenedor">

      <div className={`app-sidebar ${sidebar ? 'abierto' : 'cerrado'}`}>
        <Sidebar pagina={pagina} setPagina={setPagina} rol={rol} />
      </div>

      <div className="app-main">
        <Navbar sidebar={sidebar} setSidebar={setSidebar} pagina={pagina} tema={tema} setTema={setTema} />
        <div className="app-contenido">
          {pagina === 'dashboard' && <Dashboard />}
          {pagina === 'cargar'    && <CargarTurno />}
          {pagina === 'asesores'  && <PanelAsesores />}
          {pagina === 'historial' && <Historial />}
          {pagina === 'asesores-gestion' && <GestionAsesores/>}
          {pagina === 'vehiculos-frecuentes' && <VehiculosFrecuentes/>}
          {pagina === 'clientes' && <Clientes />}
          {pagina === 'inicio'    && <Inicio />}
          {pagina === 'turnos'    && <MisTurnos />}
          {pagina === 'perfil'    && <MiPerfil />}
        </div>
      </div>

    </div>
  )
}

export default App