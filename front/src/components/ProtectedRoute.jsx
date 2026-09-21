import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
    const { session, cargandoAuth } = useAuth();
    const location = useLocation();

    if (cargandoAuth) {
        return (
            <div className="h-screen w-screen flex items-center justify-center text-slate-400 text-sm">
                Cargando...
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}