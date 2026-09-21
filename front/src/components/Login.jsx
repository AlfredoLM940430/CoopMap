import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const destino = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setCargando(true);

        const { error } = await login(email, password);

        setCargando(false);

        if (error) {
            setError('Correo o contraseña incorrectos.');
            return;
        }

        navigate(destino, { replace: true });
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-md rounded-xl p-8 w-full max-w-sm space-y-4"
            >
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">Caja Popular Pío XII</h1>
                    <p className="text-sm text-slate-500">Inicia sesión para continuar</p>
                </div>

                <div className="space-y-1">
                    <label htmlFor="email" className="text-sm text-slate-700">
                        Correo
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="password" className="text-sm text-slate-700">
                        Contraseña
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={cargando}
                    className="w-full bg-slate-900 hover:bg-slate-800 transition-colors text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
                >
                    {cargando ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </div>
    );
}