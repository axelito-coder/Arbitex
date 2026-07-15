import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Dashboard from './pages/encargado/Dashboard'
import CargarTurno from './pages/encargado/CargarTurno'
import Inicio from './pages/asesor/Inicio'
import MisTurnos from './pages/asesor/MisTurnos'
import MiPerfil from './pages/asesor/MiPerfil'
import './App.css'

function App() {
  const [sidebar, setSidebar] = useState(true)
  const [rol, setRol] = useState('encargado')
  const [pagina, setPagina] = useState('dashboard')

  return (
    <div className="app-contenedor">

      <div className={`app-sidebar ${sidebar ? 'abierto' : 'cerrado'}`}>
        <Sidebar pagina={pagina} setPagina={setPagina} rol={rol} setRol={setRol} />
      </div>

      <div className="app-main">
        <Navbar sidebar={sidebar} setSidebar={setSidebar} pagina={pagina} />
        <div className="app-contenido">
          {/* Vistas de encargado */}
          {pagina === 'dashboard' && <Dashboard />}
          {pagina === 'cargar' && <CargarTurno />}

          {/* Vistas de asesor */}
          {pagina === 'inicio' && <Inicio />}
          {pagina === 'turnos' && <MisTurnos />}
          {pagina === 'perfil' && <MiPerfil />}
        </div>
      </div>

    </div>
  )
}

export default App