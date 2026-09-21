import { useRef, useState } from "react";
import { useGenerarPDF } from "../hook/useGenerarPDF";
import { DetalleLista } from "./DetalleLista";
import { forwardRef } from "react";

const Bloque = forwardRef(({ children, style, saltoDePagina = true }, ref) => (
    <div 
        ref={ref} 
        style={{ 
            background: "#fff", 
            pageBreakAfter: saltoDePagina ? "always" : "auto", 
            breakAfter: saltoDePagina ? "page" : "auto",
            ...style 
        }}
    >
        {children}
    </div>
));
Bloque.displayName = "Bloque";

export function BotonExportarPDF({ dataDenue, poblacion, ingresos }) {
    const [generando, setGenerando] = useState(false);
    const { generarPDF } = useGenerarPDF();

    const refDemo_encabezado  = useRef(null);   
    const refDemo_descripcion = useRef(null); 
    const refDemo_bloque1     = useRef(null);   
    const refDemo_bloque2     = useRef(null);   
    const refDemo_ingresos    = useRef(null);   
    const refDemo_riesgos     = useRef(null);   
    const refDemo_delitos     = useRef(null);   
    const refDemo_proscontras = useRef(null); 

    const refNegocios    = useRef(null);
    const refCompetencia = useRef(null);

    const handleExportar = async () => {
        if (!dataDenue || !poblacion || !ingresos) {
            alert("Selecciona primero una localidad para generar el reporte.");
            return;
        }
        setGenerando(true);
        await new Promise((r) => setTimeout(r, 350));

        const localidad    = poblacion.localidad?.replace(/\s+/g, "_") ?? "localidad";
        const municipio    = poblacion.municipio?.replace(/\s+/g, "_") ?? "municipio";
        const nombreArchivo = `Reporte_${localidad}_${municipio}.pdf`;


        await generarPDF(
            [
                {
                    titulo: `Estudio de Viabilidad Comercial: Zona de Influencia ${poblacion.localidad}`,
                    bloques: [refDemo_descripcion],
                },
                {
                    titulo: `Análisis Demográfico`,
                    bloques: [refDemo_encabezado, refDemo_bloque1, refDemo_bloque2],
                },
                {
                    titulo: "Distribución de Ingresos",
                    bloques: [refDemo_ingresos],
                },
                {
                    titulo: "Gestión de Riesgos y Éxito",
                    bloques: [refDemo_riesgos],
                },
                {
                    titulo: "Histórico de Delitos",
                    bloques: [refDemo_delitos],
                },
                {
                    titulo: "Negocios en la Zona",
                    bloques: [refNegocios],
                },
                {
                    titulo: "Competidores Directos",
                    bloques: [refCompetencia],
                },
                {
                    titulo: "Puntos Fuertes y Áreas de Riesgo",
                    bloques: [refDemo_proscontras],
                },
            ],
            nombreArchivo
        );

        setGenerando(false);
    };

    if (!dataDenue || !poblacion || !ingresos) return null;
    const demo = poblacion;

    return (
        <>
            <button
                onClick={handleExportar}
                disabled={generando}
                className="
                    w-full flex items-center justify-center gap-2
                    bg-[#031636] hover:bg-[#0c2a5e] text-white text-xs font-semibold
                    py-3 px-4 rounded-xl transition-all
                    disabled:opacity-60 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-blue-500/30
                "
            >
                {generando ? (
                    <>
                        <span className="animate-spin text-base">⏳</span>
                        Generando PDF…
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth={2}
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Exportar Reporte
                    </>
                )}
            </button>

            <div
                aria-hidden="true"
                style={{
                    position:      "absolute",
                    left:          "-9999px",
                    top:           0,
                    width:         "900px",
                    zIndex:        -1,
                    background:    "#ffffff",
                    pointerEvents: "none",
                }}
            >
                <Bloque ref={refDemo_descripcion} style={{ padding: "32px 32px 0px" }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: "#031636", marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Resumen Ejecutivo y Contexto Técnico
                    </h2>
                    
                    <p style={{ fontSize: 18, color: "#334155", lineHeight: "1.6", textAlign: "justify", margin: "0 0 16px 0" }}>
                        El presente documento técnico ofrece un diagnóstico integral del entorno socioeconómico, competitivo y de riesgo para la zona de análisis. El objetivo principal de este reporte es evaluar la viabilidad estratégica para la toma de decisiones, la mitigación de riesgos operativos y la identificación de oportunidades de colocación o expansión en la región.
                    </p>
                    
                    <p style={{ fontSize: 18, color: "#334155", lineHeight: "1.6", textAlign: "justify", margin: "0 0 12px 0" }}>
                        A lo largo del informe se desglosan indicadores estructurados en cuatro ejes fundamentales:
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20, paddingLeft: 8 }}>
                        <div style={{ fontSize: 17, color: "#475569", lineHeight: "1.5" }}>
                            <strong style={{ color: "#031636" }}>• Análisis Demográfico y Potencial de Mercado:</strong> Evaluación de las variables macro de la población, incluyendo la estructura por edad, nivel socioeconómico predominante y la distribución de la población económicamente activa (PEA) segmentada por género.
                        </div>
                        <div style={{ fontSize: 17, color: "#475569", lineHeight: "1.5" }}>
                            <strong style={{ color: "#031636" }}>• Entorno Competitivo e Institucional:</strong> Mapeo y caracterización de las unidades económicas circundantes. Esto incluye desde el inventario general de los comercios locales, hasta la identificación precisa de los competidores del sector financiero.
                        </div>
                        <div style={{ fontSize: 17, color: "#475569", lineHeight: "1.5" }}>
                            <strong style={{ color: "#031636" }}>• Seguridad y Contexto Social:</strong> Monitoreo del histórico de delincuencia anual e índices de rezago social para determinar la estabilidad del entorno operativo.
                        </div>
                        <div style={{ fontSize: 17, color: "#475569", lineHeight: "1.5" }}>
                            <strong style={{ color: "#031636" }}>• Matriz de Riesgo y Éxito:</strong> Una síntesis cualitativa y cuantitativa de los puntos fuertes y áreas de riesgo, concluyendo con un modelo predictivo que estima la probabilidad de éxito y viabilidad de colocación en el municipio.
                        </div>
                    </div>

                    <p style={{ fontSize: 17, color: "#64748b", lineHeight: "1.6", textAlign: "justify", margin: 0, fontStyle: "italic", borderTop: "1px solid #e2e8f0", paddingTop: 18 }}>
                        Con este conjunto de datos, el reporte se consolida como una herramienta indispensable para proyectar escenarios de crecimiento con un respaldo estadístico sólido y georreferenciado.
                    </p>
                </Bloque>

                <Bloque ref={refDemo_encabezado} style={{ padding: "24px 32px 8px" }}>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: "#031636", margin: 0 }}>
                        Análisis Demográfico de {demo.localidad}
                    </h1>
                    <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                        Indicadores clave de población y mercado potencial (Radio de 2km)
                    </p>
                </Bloque>

                <Bloque ref={refDemo_bloque1} style={{ padding: "8px 32px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                        <TarjetaPDF label="Población Total"        valor={demo.demografia?.poblacion_total}                    sub="Habitantes residentes en la periferia" />
                        <TarjetaPDF label="Edad Mediana"           valor={`${demo.demografia?.edad_mediana} años`}             sub="Ideal para diseño de productos" />
                        <TarjetaPDF label="NSE Predominante"       valor={demo.demografia?.nse_predominante}                   sub="Estrato socioeconómico de la zona" color="#059669" />
                    </div>
                </Bloque>

                <Bloque ref={refDemo_bloque2} style={{ padding: "8px 32px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                        <TarjetaPDF label="Hogares Habitados"      valor={demo.demografia?.viviendas_habiles}                  sub="Viviendas particulares habitadas" />
                        <TarjetaPDF label="PEA"                    valor={demo.demografia?.poblacion_economicamente_activa}    sub="Fuerza laboral disponible" />
                        <TarjetaPDF label="Rezago Social"          valor={demo.gestion_riesgos?.rezago_social_localidad}       sub="Grado según índices oficiales" />
                    </div>
                </Bloque>

                <Bloque ref={refDemo_ingresos} style={{ padding: "8px 32px" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#031636", marginBottom: 12 }}>
                        Distribución de Ingresos por Género
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16 }}>
                            <IngresosPDF datos={ingresos?.hombre} label={`Hombres – ${demo.demografia?.porcentaje_masculino}`} />
                        </div>
                        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16 }}>
                            <IngresosPDF datos={ingresos?.mujer} label={`Mujeres – ${demo.demografia?.porcentaje_femenino}`} />
                        </div>
                    </div>
                </Bloque>

                <Bloque ref={refDemo_riesgos} style={{ padding: "8px 32px" }}>
                    <RiesgosYExitoPDF demo={demo} dataDenue={dataDenue} poblacion={poblacion} />
                </Bloque>

                <Bloque ref={refDemo_delitos} style={{ padding: "8px 32px" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#031636", marginBottom: 8 }}>
                        Histórico de Delitos por Año
                    </h3>
                    <DelitosEstaticos historico={demo.gestion_riesgos?.historico_delitos_por_anio} />
                </Bloque>

                <Bloque ref={refNegocios} style={{ padding: "8px 32px" }}>
                    <DetalleLista onNavigate={() => {}} tipo="Negocios"     data={dataDenue?.comercios    || []} />
                </Bloque>

                <Bloque ref={refCompetencia} style={{ padding: "8px 32px" }}>
                    <DetalleLista onNavigate={() => {}} tipo="Competidores" data={dataDenue?.competidores || []} />
                </Bloque>

                <Bloque ref={refDemo_proscontras} style={{ padding: "8px 32px 24px" }}>
                    <VistaDemograficaProsContras dataDEUNE={dataDenue} poblacion={poblacion} ingresos={ingresos} />
                </Bloque>

            </div>
        </>
    );
}

function TarjetaPDF({ label, valor, sub, color = "#031636" }) {
    return (
        <div style={{
            background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 12, padding: "20px 18px",
        }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
                {label}
            </span>
            <div style={{ fontSize: 30, fontWeight: 800, color, marginTop: 6 }}>{valor ?? "—"}</div>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>{sub}</p>
        </div>
    );
}

import { GraficoEdades } from "./GraficoEdades";
function IngresosPDF({ datos, label }) {
    if (!datos) return <p style={{ fontSize: 12, color: "#94a3b8" }}>Sin datos</p>;
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <GraficoEdades datosRangos={datos} />
            <p style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginTop: 8 }}>{label}</p>
        </div>
    );
}

import { useRecomendacion } from "../hook/useRecomendacion";
function RiesgosYExitoPDF({ demo, dataDenue, poblacion }) {
    const agrupado = dataDenue?.comercios?.reduce((acc, item) => {
        if (item.personal) acc[item.personal] = (acc[item.personal] || 0) + 1;
        return acc;
    }, {});
    const porcentaje = useRecomendacion(poblacion, dataDenue, agrupado);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            <TarjetaPDF label="Brecha Digital"         valor={demo.gestion_riesgos?.brecha_digital}                 sub="Nivel de desconexión tecnológica" />
            <TarjetaPDF label="Semáforo de Seguridad"  valor={demo.gestion_riesgos?.semaforo_seguridad_municipal}   sub="Estatus de seguridad en el municipio" />
            <TarjetaPDF label="Probabilidad de Éxito"  valor={`${porcentaje?.clasificacion} (${porcentaje?.viabilidad}%)`} sub="Viabilidad estimada de colocación" color="#059669" />
        </div>
    );
}

import { GraficoDelitos } from "./GraficoDelitos";
function DelitosEstaticos({ historico }) {
    if (!historico) return <p style={{ fontSize: 12, color: "#94a3b8" }}>Sin datos históricos.</p>;
    return <GraficoDelitos historicoData={historico} />;
}

function VistaDemograficaProsContras({ dataDEUNE, poblacion, ingresos }) {
    const agrupado = dataDEUNE?.comercios?.reduce((acc, item) => {
        if (item.personal) acc[item.personal] = (acc[item.personal] || 0) + 1;
        return acc;
    }, {});
    const porcentaje = useRecomendacion(poblacion, dataDEUNE, agrupado);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Pros */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#065f46", marginBottom: 12 }}>✓ Puntos Fuertes</h3>
                {porcentaje?.pros?.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, background: "#f0fdf4", borderRadius: 8, padding: "6px 10px" }}>
                        <span style={{ color: "#10b981", fontWeight: 700 }}>•</span>
                        <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>{item}</p>
                    </div>
                ))}
            </div>
            {/* Contras */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#9f1239", marginBottom: 12 }}>✕ Áreas de Riesgo</h3>
                {porcentaje?.contras?.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, background: "#fff1f2", borderRadius: 8, padding: "6px 10px" }}>
                        <span style={{ color: "#f43f5e", fontWeight: 700 }}>•</span>
                        <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>{item}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
