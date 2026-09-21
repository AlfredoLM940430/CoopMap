import { useState, useMemo, memo } from "react";

const FilaEstablecimiento = memo(({ item }) => {
    return (
        <tr className="hover:bg-slate-50/80 transition-colors group">
            <td className="p-4 pl-6 font-semibold text-[#031636]">{item.nombre}</td>
            <td className="p-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {item.giro}
                </span>
            </td>
            <td className="p-4 text-slate-500 max-w-[250px] truncate" title={item.direccion}>
                {item.direccion || <span className="text-slate-300 italic">No disponible</span>}
            </td>
            <td className="p-4 text-center text-slate-600 font-medium">{item.personal || "-"}</td>
            <td className="p-4 text-center">
                {item.sitio_web && item.sitio_web !== "Sin datos en DENUE" ? (
                <a 
                    href={item.sitio_web.startsWith('http') ? item.sitio_web : `https://${item.sitio_web}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline bg-blue-50 hover:bg-blue-100/70 px-3 py-1 rounded-lg transition-all"
                >
                    Visitar
                </a>
                ) : (
                <span className="text-xs text-slate-300 italic">Sin sitio</span>
                )}
            </td>
        </tr>
    );
});

FilaEstablecimiento.displayName = "FilaEstablecimiento";

export const DetalleLista = ({ onNavigate, tipo, data = [] }) => { 
    const esNegocio = tipo?.toLowerCase() === "negocios";

    const { destacados, datosTabla } = useMemo(() => {
        const des = esNegocio ? data?.slice(0, 3) : [];
        const tab = esNegocio ? data?.slice(3) : data;
        return { destacados: des, datosTabla: tab || [] };
    }, [data, esNegocio]);

    const [limiteFilas, setLimiteFilas] = useState(40);

    const datosVisibles = useMemo(() => {
        return datosTabla.slice(0, limiteFilas);
    }, [datosTabla, limiteFilas]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 60) {
            if (limiteFilas < datosTabla.length) {
                setLimiteFilas((prev) => Math.min(prev + 40, datosTabla.length));
            }
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto animate-fade-in text-slate-700 select-none">
            <button 
                onClick={() => onNavigate("mapa")}
                className="mb-5 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors focus:outline-none"
            >
                ← Regresar al Mapa
            </button>
            
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#031636] tracking-tight capitalize">
                    Principales {tipo} o Instituciones
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                    {esNegocio 
                        ? "Principales establecimientos comerciales y registro completo de la zona." 
                        : "Lista detallada de establecimientos registrados en la zona de búsqueda."}
                </p>
            </div>

            {esNegocio && destacados.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {destacados.map((item) => (
                        <div 
                            key={`top-${item.id}`} 
                            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between transition-all hover:shadow-md"
                        >
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    {item.giro}
                                </span>
                                <h3 className="text-base font-bold text-[#031636] line-clamp-1 mb-1" title={item.nombre}>
                                    {item.nombre}
                                </h3>
                                <p className="text-xs text-slate-400 line-clamp-2 mb-4" title={item.direccion}>
                                    📍 {item.direccion || "Dirección no disponible"}
                                </p>
                            </div>

                            <div className="border-t border-slate-100 pt-3 mt-2 flex items-center justify-between text-xs">
                                <span className="text-slate-500">
                                    👥 Personal: <strong className="text-slate-700">{item.personal || "-"}</strong>
                                </span>
                                
                                {item.sitio_web && item.sitio_web !== "Sin datos en DENUE" && (
                                    <a 
                                        href={item.sitio_web.startsWith('http') ? item.sitio_web : `https://${item.sitio_web}`}
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-blue-600 font-semibold hover:underline"
                                    >
                                        Sitio Web ↗
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {datosTabla.length > 0 && (
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Todos los Establecimientos ({data?.length})
                </h2>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div 
                    onScroll={handleScroll} 
                    className="overflow-x-auto overflow-y-auto max-h-[420px] scrollbar-thin"
                >
                    <table className="w-full min-w-[800px] border-collapse text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400 tracking-wider sticky top-0 z-10 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                            <tr>
                                <th className="p-4 pl-6 bg-slate-50">Nombre</th>
                                <th className="p-4 bg-slate-50">Giro / Actividad</th>
                                <th className="p-4 bg-slate-50">Dirección</th>
                                <th className="p-4 text-center bg-slate-50">Personal</th>
                                <th className="p-4 text-center bg-slate-50">Sitio Web</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {datosVisibles.length > 0 ? (
                                datosVisibles.map((item) => (
                                    <FilaEstablecimiento key={`row-${item.id}`} item={item} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-sm text-slate-400 italic bg-slate-50/30">
                                        No hay registros para mostrar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};