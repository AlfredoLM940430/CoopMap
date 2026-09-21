import { useEffect, useState } from "react";
import { BotonExportarPDF } from "./BotonExportarPDF";
import { SelectorRango } from "./RangoKM";
import { fetchEstados, fetchLocalidades, fetchMunicipios } from "../api/api";

export const SideBar = ({
    onNavigate, 
    onLocationChange, 
    resumen,            // DATOS DENUE
    poblacion,          // DATOS GUARDADOS EN onLocationChange (ubicacionActiva)
    cargando,
    dataDenue,
    ingresos,
    radioKm,
    setRadioKm,
}) => {

    const [listaEstados, setListaEstados] = useState([]);
    const [listaMunicipios, setListaMunicipios] = useState([]);
    const [listaLocalidades, setListaLocalidades] = useState([]); 

    const [estado, setEstado] = useState("");
    const [municipio, setMunicipio] = useState("");
    const [localidad, setLocalidad] = useState("");

    useEffect(() => {
        fetchEstados()
            .then((data) => setListaEstados(data))
            .catch((err) => console.error("Error cargando estados:", err));
    }, []);

    useEffect(() => {
        if (estado) {
            setListaMunicipios([]);
            setListaLocalidades([]);
            setMunicipio("");
            setLocalidad("");
            
            fetchMunicipios(estado)
                .then((data) => setListaMunicipios(data))
                .catch((err) => console.error("Error cargando municipios:", err));
        }
    }, [estado]);

    useEffect(() => {
        if (municipio && estado) {
            setListaLocalidades([]);
            setLocalidad("");

            fetchLocalidades(estado, municipio)
                .then((data) => setListaLocalidades(data))
                .catch((err) => console.error("Error cargando localidades:", err));
        }
    }, [municipio, estado]);

    useEffect(() => {
        const sincronizarPoblacion = async () => {
            if (poblacion?.estado && poblacion?.municipio) {
                try {
                    setEstado(poblacion.estado);
                    
                    const municipios = await fetchMunicipios(poblacion.estado);
                    setListaMunicipios(municipios);
                    setMunicipio(poblacion.municipio);
                    
                    const localidades = await fetchLocalidades(poblacion.estado, poblacion.municipio);
                    setListaLocalidades(localidades);
                    
                    if (poblacion.localidad) {
                        setLocalidad(poblacion.localidad);
                    }
                } catch (err) {
                    console.error("Error al sincronizar selectores desde 'poblacion':", err);
                }
            }
        };

        sincronizarPoblacion();
    }, [poblacion]);

    useEffect(() => {
        if (localidad && estado && municipio) {
            const objetoLocalidad = listaLocalidades.find(i => i.localidad === localidad) || poblacion;
            
            if (objetoLocalidad) {
                const objEstadoMunicipio = {
                    ...objetoLocalidad,
                    estado: estado,
                    municipio: municipio
                };
                onLocationChange(objEstadoMunicipio);
            }
        }
    }, [radioKm]);

    const handleLocalidadChange = (e) => {
        const valorSeleccionado = e.target.value;
        setLocalidad(valorSeleccionado);

        const objetoLocalidad = listaLocalidades.find(i => i.localidad === valorSeleccionado);
        const objEstadoMunicipio = {
            ...objetoLocalidad,
            estado: estado,
            municipio: municipio
        }
        
        if (objetoLocalidad) {
            onLocationChange(objEstadoMunicipio); 
        }
    };  
 
    return (
        <>
            <aside className="w-[380px] border-r border-slate-200 bg-slate-50/75 backdrop-blur-md p-6 flex flex-col gap-6 h-full overflow-y-auto select-none">

                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estado</label>
                        <select 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium text-sm text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 outline-none cursor-pointer appearance-none"
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                            >
                            <option value="" className="text-slate-400">Selecciona un estado...</option>
                                {listaEstados.map((edo) => (
                                    <option key={edo} value={edo}>{edo}</option>
                                ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Municipio</label>
                        <select 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium text-sm text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 outline-none cursor-pointer disabled:bg-slate-100/50 disabled:text-slate-400 disabled:cursor-not-allowed"
                            value={municipio}
                            onChange={(e) => setMunicipio(e.target.value)} 
                            disabled={!estado}
                            >
                            <option value="" className="text-slate-400">Selecciona un municipio...</option>
                            {listaMunicipios.map((mun) => (
                                <option key={mun} value={mun}>{mun}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Localidad</label>
                        <select 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium text-sm text-slate-700 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 outline-none cursor-pointer disabled:bg-slate-100/50 disabled:text-slate-400 disabled:cursor-not-allowed"
                            value={localidad}
                            onChange={handleLocalidadChange} 
                            disabled={!municipio}
                            >
                            <option value="" className="text-slate-400">Selecciona una localidad...</option>
                            {listaLocalidades.map((loc, id) => (
                                <option key={id} value={loc.localidad}>{loc.localidad}</option>
                            ))}
                        </select>
                    </div>

                    <SelectorRango radioKm={radioKm} setRadioKm={setRadioKm}/>
                </div>


                {cargando && (
                <div className="flex items-center justify-center gap-3 p-3.5 bg-blue-50/60 border border-blue-100 text-blue-700 text-xs font-medium rounded-xl animate-pulse shadow-sm">
                    <span className="text-base animate-spin">⏳</span> 
                    <span>Extrayendo y limpiando datos del DENUE...</span>
                </div>
                )}

                {(resumen && cargando == false ) && (
                    <div className="flex flex-col gap-4 mt-2">
                    
                        <BotonExportarPDF 
                            dataDenue={dataDenue}
                            poblacion={poblacion}
                            ingresos={ingresos}
                        />

                        <div className="border-t border-slate-100 pt-4 mb-1">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Análisis del Entorno</p>
                        </div>

                        <button 
                            onClick={() => onNavigate("negocios")}
                            className="group text-left w-full bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <h3 className="font-semibold text-xs text-slate-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                                Negocios en la zona
                            </h3>
                            <div className="text-3xl font-black text-slate-800 mt-1.5 group-hover:text-blue-600 transition-colors">
                                {resumen.total_comercios?.toLocaleString() || "0"}
                            </div>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                Giro comercial general en un radio de <span className="font-semibold text-slate-600">{radioKm/1000} km</span>.
                            </p>
                        </button>

                        <button 
                            onClick={() => onNavigate("competencia")}
                            className="group text-left w-full bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-red-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        >
                            <h3 className="font-semibold text-xs text-slate-500 uppercase tracking-wider group-hover:text-red-600 transition-colors">
                                Competidores directos
                            </h3>
                            <div className="text-3xl font-black text-slate-800 mt-1.5 group-hover:text-red-600 transition-colors">
                                {resumen.total_competidores?.toLocaleString() || "0"}
                            </div>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                Bancos, Cajas Populares y SOFIPOs filtradas.
                            </p>
                        </button>

                        <button 
                            onClick={() => onNavigate("demografica")}
                            className="group text-left w-full bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                            <h3 className="font-semibold text-xs text-slate-500 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
                                Análisis Demográfico
                            </h3>
                            <div className="text-3xl font-black text-slate-800 mt-1.5 group-hover:text-emerald-600 transition-colors">
                                {poblacion?.demografia?.poblacion_economicamente_activa?.toLocaleString() || "0"}
                            </div>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                Socios Potenciales Estimados.
                            </p>
                        </button>
                    </div>
                )}
            </aside>
        </>
    )
}