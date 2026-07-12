import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Dashboard from './pages/encargado/Dashboard'
import CargarTurno from './pages/encargado/CargarTurno'
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
          {pagina === 'dashboard' && <Dashboard />}
          {pagina ==='cargar' && <CargarTurno/>}
        </div>
      </div>

    </div>
  )
}

export default App