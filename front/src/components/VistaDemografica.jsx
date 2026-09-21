import { useMemo, useState } from "react";
import { useRecomendacion } from "../hook/useRecomendacion";
import { GraficoDelitos } from "./GraficoDelitos";
import { GraficoEdades } from "./GraficoEdades";
import { GoogleGenAI } from '@google/genai';

export default function VistaDemografica({ dataDEUNE, onNavigate, poblacion, ingresos}) {
    
    const [analisisIA, setAnalisisIA] = useState(null);
    const [cargandoIA, setCargandoIA] = useState(false);
    const [errorIA, setErrorIA] = useState(null);

    const demo = poblacion || {
        poblacion_total: "No disponible",
        edad_mediana: "No disponible",
        nse_predominante: "No disponible",
        viviendas_habiles: "No disponible",
        poblacion_economicamente_activa: "No disponible"
    };
    
    const agrupado = useMemo(() => {
        return dataDEUNE?.comercios?.reduce((acumulador, item) => { 
            const rango = item.personal; 
            if (rango) {
                acumulador[rango] = (acumulador[rango] || 0) + 1;
            }
            return acumulador;
        }, {}) || {};
    }, [dataDEUNE]);

    const porcentaje = useRecomendacion(poblacion, dataDEUNE, agrupado);
    
    const generarAnalisisConIA = async () => {
        setCargandoIA(true);
        setErrorIA(null);

        try {
            const ai = new GoogleGenAI({ 
                apiKey: import.meta.env.VITE_GEMINI_API_KEY 
            });
            
            const FREE_TIER_MODEL = 'gemini-3.6-flash';

            const prompt = `
                Actúa como experto en geomarketing para cooperativas financieras (SOCAP).
                Analiza los siguientes datos de la localidad de estudio para abrir una sucursal:
                - Ubicación: ${poblacion?.localidad || 'N/A'}, ${poblacion?.municipio || 'N/A'}
                - Población Total: ${demo.demografia?.poblacion_total || demo.poblacion_total}
                - Edad Mediana: ${demo.demografia?.edad_mediana || demo.edad_mediana} años
                - NSE: ${demo.demografia?.nse_predominante || demo.nse_predominante}
                - PEA: ${demo.demografia?.poblacion_economicamente_activa || demo.poblacion_economicamente_activa}
                - Comercios (DENUE): ${dataDEUNE?.resumen?.total_comercios || 'N/A'}
                - Competencia Directa: ${dataDEUNE?.resumen?.total_competidores || 'N/A'}
                - Viabilidad: ${porcentaje?.viabilidad}% (${porcentaje?.clasificacion})

                Genera un análisis conciso y directo que incluya:
                1. Resumen de mercado.
                2. Pros clave para la SOCAP.
                3. Contras y riesgos principales.
                4. Recomendación estratégica final.
            `;
            // const prompt = `
            //     Actúa como un experto senior en geomarketing, expansión comercial y análisis financiero, especializado en el sector de Sociedades Cooperativas de Ahorro y Préstamo (SOCAP).
                
            //     Analiza los siguientes datos estadísticos de la localidad de estudio para evaluar la apertura de una nueva sucursal:
            //     - Ubicación: ${poblacion?.localidad || 'N/A'}, ${poblacion?.municipio || 'N/A'}
            //     - Población Total: ${demo.demografia?.poblacion_total || demo.poblacion_total}
            //     - Edad Mediana: ${demo.demografia?.edad_mediana || demo.edad_mediana} años
            //     - Nivel Socioeconómico (NSE): ${demo.demografia?.nse_predominante || demo.nse_predominante}
            //     - Población Económicamente Activa (PEA): ${demo.demografia?.poblacion_economicamente_activa || demo.poblacion_economicamente_activa}
            //     - Total de Comercios en la zona (DENUE): ${dataDEUNE?.resumen?.total_comercios || 'N/A'}
            //     - Competencia Directa detectada: ${dataDEUNE?.resumen?.total_competidores || 'N/A'}
            //     - Viabilidad estimada actual: ${porcentaje?.viabilidad}% (${porcentaje?.clasificacion})

            //     INSTRUCCIÓN DE ANÁLISIS:
            //     Coteja y enriquece estos datos cruzándolos con tu conocimiento general sobre el contexto económico, comercial, demográfico y el nivel de penetración financiera de esta región específica en México. No te limites solo a repetir los números proporcionados; interpreta lo que implican para un modelo de negocio cooperativo (captación de ahorro y colocación de créditos).

            //     Genera un informe profesional, conciso y estructurado bajo los siguientes apartados:
            //     1. Resumen Ejecutivo del Mercado y Contexto Regional.
            //     2. Pros Clave (Oportunidades de negocio, perfil de ahorro/crédito y vocación comercial).
            //     3. Contras y Riesgos Principales (Competencia, informalidad o barreras de adopción financiera).
            //     4. Recomendación Estratégica Final (Viabilidad de apertura y enfoque comercial sugerido para la SOCAP).
            // `;

            const response = await ai.models.generateContent({
                model: FREE_TIER_MODEL,
                contents: prompt,
            });

            setAnalisisIA(response.text);
        } catch (error) {
            console.error("Error al generar análisis con IA:", error);
            
            // Detectar si es error 503 (Alta demanda / Servidor no disponible) o 429 (Límite excedido)
            if (error.status === 503 || (error.message && error.message.includes('high demand'))) {
                setErrorIA('Los servidores de IA están experimentando alta demanda en este momento (Error 503). Por favor, intenta de nuevo en unos segundos.');
            } else if (error.status === 429 || (error.message && error.message.includes('ResourceExhausted'))) {
                setErrorIA('Se ha alcanzado temporalmente el límite de peticiones de la capa gratuita. Intenta de nuevo más tarde.');
            } else {
                setErrorIA('Ocurrió un error al generar el análisis inteligente. Revisa tu consola.');
            }
        } finally {
            setCargandoIA(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto animate-fade-in text-gray-700">
            <button 
                onClick={() => onNavigate("mapa")}
                className="mb-6 text-sm font-medium text-secondary hover:text-secondary-hover flex items-center gap-2 transition-colors focus:outline-none"
            >
                ← Regresar al Mapa
            </button>

            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#031636] tracking-tight">
                        Análisis Demográfico de {poblacion.localidad}, {poblacion.municipio}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Indicadores clave de población y mercado potencial.
                    </p>
                </div>

                <button
                    onClick={generarAnalisisConIA}
                    disabled={cargandoIA}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm whitespace-nowrap"
                >
                    {cargandoIA ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Analizando zona...
                        </>
                    ) : (
                        <>✨ Generar Análisis con IA (Gratis)</>
                    )}
                </button>
            </div>

            {(analisisIA || cargandoIA || errorIA) && (
                <div className="bg-gradient-to-br from-indigo-50/60 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm mb-8">
                    <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
                        <span>🤖</span> Análisis Estratégico de Inteligencia Artificial
                    </h3>

                    {cargandoIA && (
                        <div className="py-8 text-center text-gray-500 text-sm flex flex-col items-center justify-center gap-2">
                            <div className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            Procesando variables demográficas y de competencia con modelo Flash...
                        </div>
                    )}

                    {errorIA && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm">
                            {errorIA}
                        </div>
                    )}

                    {analisisIA && !cargandoIA && (
                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                            {analisisIA}
                        </div>
                    )}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm transition-all hover:shadow-md">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Población Total</span>
                    <div className="text-4xl font-extrabold text-[#031636] mt-2">{demo.demografia.poblacion_total}</div>
                    <p className="text-xs text-gray-400 mt-2">Habitantes residentes detectados en la periferia</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm transition-all hover:shadow-md">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Edad Mediana</span>
                    <div className="text-4xl font-extrabold text-secondary mt-2">
                        {demo.demografia.edad_mediana} <span className="text-lg font-normal text-gray-500">años</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Ideal para diseño de productos de captación/crédito</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm transition-all hover:shadow-md">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nivel Socioeconómico (NSE)</span>
                    <div className="text-4xl font-extrabold text-emerald-600 mt-2">{demo.demografia.nse_predominante}</div>
                    <p className="text-xs text-gray-400 mt-2">Estrato socioeconómico predominante en la zona</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm transition-all hover:shadow-md">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hogares Habitados</span>
                    <div className="text-4xl font-extrabold text-[#031636] mt-2">{demo.demografia.viviendas_habiles}</div>
                    <p className="text-xs text-gray-400 mt-2">Viviendas particulares habitadas</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm transition-all hover:shadow-md">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Población Econ. Activa (PEA)</span>
                    <div className="text-4xl font-extrabold text-[#031636] mt-2">{demo.demografia.poblacion_economicamente_activa}</div>
                    <p className="text-xs text-gray-400 mt-2">Fuerza laboral disponible en el área</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm transition-all hover:shadow-md">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rezago Social</span>
                    <div className="text-4xl font-extrabold text-[#031636] mt-2">{demo.gestion_riesgos.rezago_social_localidad}</div>
                    <p className="text-xs text-gray-400 mt-2">Grado de rezago según índices oficiales</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm mb-8">
                <h3 className="text-lg font-bold text-[#031636] mb-4 text-left">Distribución de Ingresos por Género</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col items-center bg-gray-50 p-4 rounded-xl">
                        <GraficoEdades datosRangos={ingresos.hombre} />
                        <p className="text-sm font-semibold text-gray-600 mt-3">Hombres <span>{poblacion.demografia.porcentaje_masculino}</span></p>
                    </div>
                    <div className="flex flex-col items-center bg-gray-50 p-4 rounded-xl">
                        <GraficoEdades datosRangos={ingresos.mujer}/>
                        <p className="text-sm font-semibold text-gray-600 mt-3">Mujeres <span>{poblacion.demografia.porcentaje_femenino}</span></p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm transition-all hover:shadow-md">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Brecha Digital</span>
                    <div className="text-4xl font-extrabold text-[#031636] mt-2">{demo.gestion_riesgos.brecha_digital}</div>
                    <p className="text-xs text-gray-400 mt-2">Nivel de desconexión o acceso a tecnologías</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm transition-all hover:shadow-md">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Semáforo de Seguridad</span>
                    <div className="text-4xl font-extrabold text-secondary mt-2">{demo.gestion_riesgos.semaforo_seguridad_municipal}</div>
                    <p className="text-xs text-gray-400 mt-2">Estatus de seguridad en el municipio</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm transition-all hover:shadow-md bg-gradient-to-br from-white to-emerald-50/30">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Probabilidad de Éxito</span>
                    <div className="text-4xl font-black text-emerald-600 mt-2">
                        {porcentaje.clasificacion} <span className="text-xl font-bold">({porcentaje.viabilidad}%)</span>
                    </div>
                    <p className="text-xs text-emerald-700/70 mt-2">Viabilidad estimada de colocación</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm mb-8">
                <h3 className="text-lg font-bold text-[#031636] mb-4">Histórico de Delitos por Año</h3>
                <GraficoDelitos historicoData={demo.gestion_riesgos.historico_delitos_por_anio} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm">
                    <h3 className="text-lg font-bold text-emerald-700 mb-4 flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">✓</span>
                        Puntos Fuertes (Pros)
                    </h3>
                    <div className="space-y-3">
                        {porcentaje.pros.map((item, ix) => (
                            <div key={ix} className="flex items-start gap-2 text-sm text-gray-600 bg-emerald-50/50 p-2 rounded-lg">
                                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                                <p>{item}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm">
                    <h3 className="text-lg font-bold text-rose-700 mb-4 flex items-center gap-2">
                        <span className="bg-rose-100 text-rose-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">✕</span>
                        Áreas de Riesgo (Contras)
                    </h3>
                    <div className="space-y-3">
                        {porcentaje.contras.map((item, ix) => (
                            <div key={ix} className="flex items-start gap-2 text-sm text-gray-600 bg-rose-50/50 p-2 rounded-lg">
                                <span className="text-rose-500 font-bold mt-0.5">•</span>
                                <p>{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}