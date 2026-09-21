import { useEffect, useState } from "react";
import logo from "../../public/img/logo-caja-pio.png"
import { fetchLocalidad } from "../api/api";
import { useAuth } from "../context/AuthContext";
import Swal from 'sweetalert2';

export const TopBar = ({ ubicacion, onLocationChange }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const { user, logout } = useAuth();

    useEffect(() => {
        if (ubicacion) {
            setSearchTerm(`${ubicacion.localidad}, ${ubicacion.municipio}`);
        } else {
            setSearchTerm("");
        }
    }, [ubicacion]);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if(value.length > 3) {
            try {
                const data = await fetchLocalidad(value)
                setResults(data);
            } catch (error) {
                alert(error.message); 
            }
        }
    }

    const onReset = () => {
        window.location.reload();
    };

    const handleLogout = async () => await logout();
    
    const confirmLogout = () => {
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: '¿Estás seguro de que deseas salir de tu cuenta?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb', // Color primario (ej. blue-600)
            cancelButtonColor: '#6b7280',  // Color gris (ej. gray-500)
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar',
            customClass: {
                popup: 'rounded-2xl',
            }
        }).then((result) => {
            if (result.isConfirmed) {
                handleLogout();
            }
        });
    };
  
return (
        <header className="h-20 border-b border-slate-100 bg-white/80 backdrop-blur-md flex justify-between items-center px-6 sm:px-8 z-50 sticky top-0 shadow-sm transition-all">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={onReset}>
                <img 
                    src={logo} 
                    alt="Logo" 
                    width={140} 
                    className="transition-transform duration-200 group-hover:scale-105" 
                />
            </div>

            <div className="relative w-72 sm:w-96">
                <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input 
                        type="text" 
                        placeholder="Buscar localidad..." 
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-inner"
                    />
                </div>

                {results.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {results.map((item, index) => (
                            <div 
                                key={index}
                                className="p-3.5 hover:bg-blue-50/50 cursor-pointer transition-colors flex flex-col gap-0.5"
                                onClick={() => {
                                    onLocationChange(item); 
                                    setResults([]);
                                }}
                            >
                                <p className="font-semibold text-sm text-slate-800">{item.localidad}</p>
                                <p className="text-xs text-slate-500">{item.municipio}, {item.estado}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                {user?.email && (
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-medium text-slate-600">{user.email}</span>
                    </div>
                )}
                
                <button
                    onClick={confirmLogout}
                    className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">Cerrar sesión</span>
                </button>
            </div>
        </header>
    )}