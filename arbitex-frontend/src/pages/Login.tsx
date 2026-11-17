import '../styles/Login.css'
import { useEffect, useState } from 'react'
type Props = {
    onLogin: (rol: string) => void
}
function Login({ onLogin }: Props) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [verPassword, setVerPassword] = useState(false)
    const [animacionLista, setAnimacionLista] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setAnimacionLista(true), 2400)
        return () => clearTimeout(timer)
    }, [])

    async function handleLogin() {
        if (!email || !password) {
            setError('Completá todos los campos')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.mensaje || 'Credenciales incorrectas')
                return
            }

            localStorage.setItem('token', data.token)
            localStorage.setItem('rol', data.usuario.rol)
            localStorage.setItem('nombre', data.usuario.nombre)

            onLogin(data.usuario.rol)
        } catch {
            setError('Error al conectar con el servidor')
        } finally {
            setLoading(false)
        }

    }

    return (
        <div className="login-fondo">

            {/* ANIMACIÓN DEL LOGO */}
            <div className={`login-animacion ${animacionLista ? 'login-animacion-oculta' : ''}`}>
                <div className="login-anim-container">

                    <div className="login-symbol">
                        <div className="arrow-track-1">
                            <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
                                <path d="M 70 15 A 55 55 0 0 1 120 93" stroke="#1A1A1A" strokeWidth="3.5" strokeLinecap="round" />
                                <polygon points="120,93 108,98 115,86" fill="#1A1A1A" />
                            </svg>
                        </div>
                        <div className="arrow-track-2">
                            <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
                                <path d="M 70 15 A 55 55 0 0 1 120 93" stroke="#EB0A1E" strokeWidth="3.5" strokeLinecap="round" />
                                <polygon points="120,93 108,98 115,86" fill="#EB0A1E" />
                            </svg>
                        </div>
                        <div className="center-dot"></div>
                    </div>

                    <div className="login-brand">
                        <div className="login-logo-text">ARBITEX</div>
                        <div className="login-divider"></div>
                        <div className="login-subtitle">Cada turno en su lugar.</div>
                    </div>

                </div>
            </div>

            <div className="login-contenedor">
                <div className="login-logo">
                    {/* símbolo girando */}
                    <div className="login-symbol-small">
                        <div className="arrow-track-1">
                            <svg width="60" height="60" viewBox="0 0 140 140" fill="none">
                                <path d="M 70 15 A 55 55 0 0 1 120 93" stroke="#1A1A1A" strokeWidth="3.5" strokeLinecap="round" />
                                <polygon points="120,93 108,98 115,86" fill="#1A1A1A" />
                            </svg>
                        </div>
                        <div className="arrow-track-2">
                            <svg width="60" height="60" viewBox="0 0 140 140" fill="none">
                                <path d="M 70 15 A 55 55 0 0 1 120 93" stroke="#EB0A1E" strokeWidth="3.5" strokeLinecap="round" />
                                <polygon points="120,93 108,98 115,86" fill="#EB0A1E" />
                            </svg>
                        </div>
                        <div className="center-dot-small"></div>
                    </div>

                    <p className="login-nombre">ARBITEX</p>
                    <p className="login-subtitulo">SERVICE MANAGEMENT</p>
                </div>

                <div className='login-form'>
                    <div className='login-campo'>
                        <label htmlFor="login-label">EMAIL</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder='usuario@arbitex.com' autoComplete='off' className='login-input' />
                    </div>

                    <div className='login-campo'>
                        <label htmlFor="login-label">CONTRASEÑA</label>
                        <div className='login-input-wrapper'>
                            <input
                                type={verPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                placeholder='••••••••'
                                autoComplete='off'
                                className='login-input'
                            />
                            <button
                                type='button'
                                className='login-toggle-pass'
                                onClick={() => setVerPassword(!verPassword)}
                            >
                                {verPassword ? (
                                    // Ojo tachado (ocultar)
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    // Ojo abierto (mostrar)
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && <div className='login-error'>{error}</div>}

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className={`login-btn ${loading ? 'login-btn-loading' : ''}`}>

                        {loading ? 'Ingresando...' : 'INGRESAR'}

                    </button>
                </div>

                <p className='login-footer'>Asahi Motors S.A  Sistema de gestión de service</p>
            </div>
        </div>
    )
}

export default Login