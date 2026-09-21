import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

export const GraficoDelitos = ({historicoData}) => {

    const dataFormateada = historicoData
        ? Object.keys(historicoData)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map((anio) => ({
                year: anio,
                Delitos: historicoData[anio],
            }))
        : [];

    if (dataFormateada.length === 0) {
        return <p style={{ color: "#888", fontSize: "14px" }}>No hay datos históricos disponibles.</p>;
    }

    return (
        <>
        <div style={{ width: "100%", height: 220, marginTop: "15px" }}>
            <h4 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "14px", fontFamily: "sans-serif" }}>
                Tendencia Histórica de Delincuencia (Anual)
            </h4>
            
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={dataFormateada}
                    margin={{ top: 5, right: 20, left: -20, bottom: 0 }}
                >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                
                <XAxis 
                    dataKey="year" 
                    tick={{ fill: "#666", fontSize: 11 }} 
                    axisLine={{ stroke: "#ccc" }}
                />
                
                <YAxis 
                    tick={{ fill: "#666", fontSize: 11 }} 
                    axisLine={{ stroke: "#ccc" }}
                />
                
                <Tooltip 
                    contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ccc" }}
                    labelStyle={{ fontWeight: "bold", color: "#333" }}
                />
                
                <Area
                    type="monotone"
                    dataKey="Delitos"
                    stroke="#d32f2f"
                    fill="#ffebee"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                />
                </AreaChart>
            </ResponsiveContainer>
        </div>
        </>
)}