import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './components/Login';
import { TopBar } from './components/TopBar';
import { SideBar } from './components/SideBar';
import { MapView } from './components/MapView';
import { DetalleLista } from './components/DetalleLista';
import VistaDemografica from './components/VistaDemografica';
import { fetchDenueData, fetchIngresosEstado } from './api/api';

function GeomarketApp() {
    const [ubicacionActiva, setUbicacionActiva] = useState(null);
    const [dataDenue, setDataDenue] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [vista, setVista] = useState("mapa");
    const [DatosIngresos, setDatosIngresos] = useState(null);
    const [ingresosEdad, setIngresosEdad] = useState();
    const [radioKm, setRadioKm] = useState(3000);

    const callDenueData = async (lat, lon) => {
        setCargando(true);
        try {
            const datos = await fetchDenueData(lat, lon, radioKm);

            if (datos.status === "success") {
                setDataDenue(datos);
            } else {
                alert("Error del servidor: " + datos.message);
            }
        } catch (error) {
            alert("No se pudo conectar con el servidor Backend.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (ubicacionActiva && ubicacionActiva.coordenadas) {
            const [lat, lon] = ubicacionActiva.coordenadas.split(",");
            callDenueData(lat, lon);
        }
    }, [ubicacionActiva]);

    const buscarIngresosEstado = async (nombreEstado) => {
        if (nombreEstado) {
            try {
                const data = await fetchIngresosEstado(nombreEstado);
                setDatosIngresos(data);
            } catch (error) {
                alert(error.message);
            }
        }
    };

    useEffect(() => {
        if (ubicacionActiva) {
            buscarIngresosEstado(ubicacionActiva?.estado);
        }
    }, [ubicacionActiva]);

    useEffect(() => {
        const poblacionLimpia = ubicacionActiva?.demografia?.poblacion_total?.toString().replace(/,/g, '').trim();
        const poblacionTotal = Number(poblacionLimpia) || 0;

        if (Number(poblacionTotal) < 20000) {
            setIngresosEdad(DatosIngresos?.rural);
        } else {
            setIngresosEdad(DatosIngresos?.urbana);
        }
    }, [DatosIngresos]);

    const vistasRenderizadas = useMemo(() => {
        return {
            mapa: (
                <MapView
                    ubicacion={ubicacionActiva}
                    setUbicacionActiva={setUbicacionActiva}
                    consulta={callDenueData}
                    data={dataDenue}
                />
            ),
            negocios: (
                <DetalleLista
                    onNavigate={setVista}
                    tipo="Negocios"
                    data={dataDenue?.comercios || []}
                />
            ),
            competencia: (
                <DetalleLista
                    onNavigate={setVista}
                    tipo="Competidores"
                    data={dataDenue?.competidores || []}
                />
            ),
            demografica: (
                <VistaDemografica
                    onNavigate={setVista}
                    tipo="Demografia"
                    dataDEUNE={dataDenue || []}
                    poblacion={ubicacionActiva || []}
                    ingresos={ingresosEdad}
                />
            ),
        };
    }, [ubicacionActiva, dataDenue, ingresosEdad, setVista]);

    return (
        <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden antialiased">
            <TopBar
                ubicacion={ubicacionActiva}
                onLocationChange={setUbicacionActiva}
            />

            <div className="flex-1 flex overflow-hidden w-full relative">
                <SideBar
                    onNavigate={setVista}
                    onLocationChange={setUbicacionActiva}
                    resumen={dataDenue?.resumen}
                    poblacion={ubicacionActiva}
                    cargando={cargando}
                    dataDenue={dataDenue}
                    ingresos={ingresosEdad}
                    radioKm={radioKm}
                    setRadioKm={setRadioKm}
                />

                <main className="flex-1 bg-slate-100/60 overflow-y-auto relative">
                    {vistasRenderizadas[vista] || (
                        <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                            Selecciona una opción en el menú lateral para comenzar.
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <GeomarketApp />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}