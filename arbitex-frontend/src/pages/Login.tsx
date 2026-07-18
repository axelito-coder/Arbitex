import '../styles/Login.css'
import { useState  } from 'react'
type Props = {
    onLogin: (rol: string) => void
}
function Login({onLogin}: Props){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function  handleLogin() {
        if(!email || !password){
            setError('Completá todos los campos')
            return
        }

        setLoading(true)
        setError('')

        try{
            const res = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password}),
            })

            const data = await res.json()

            if(!res.ok){
                setError(data.mensaje || 'Credenciales incorrectas')
                return
            }

            localStorage.setItem('token', data.token)
            localStorage.setItem('rol', data.usuario.rol)
            localStorage.setItem('nombre', data.usuario.nombre)

            onLogin(data.usuario.rol)
        } catch{
            setError('Error al conectar con el servidor')
        } finally {
            setLoading(false)
        }
    
    }

    return(
        <div className="login-fondo">
            <div className="login-contenedor">
             <div className="login-logo">
                <p className="login-nombre">ARBITEX</p>
                <p className="login-subtitulo">SERVICE MANAGEMENT</p>
             </div>
             
             <div className='login-form'>
                <div className='login-campo'>
                    <label htmlFor="login-label">EMAIL</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder='usuario@arbitex.com' autoComplete='off' className='login-input'/>
                </div>

                <div className='login-campo'>
                    <label htmlFor="login-label">CONTRASEÑA</label>
                    <input type="input" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder='••••••••' autoComplete='off' className='login-input'/>
                </div>

                {error && <div className='login-error'>{error}</div>}

                <button
                onClick={handleLogin}
                disabled={loading}
                className={`login-btn ${loading ? 'login-btn-loading' : ''}`}>

                    {loading ? 'Ingresando...': 'INGRESAR'}

                </button>
             </div>
             
             <p className='login-footer'>Asahi Motors S.A  Sistena de gestión de service</p>
            </div>
        </div>
    )
}

export default Login