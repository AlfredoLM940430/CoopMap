export const useViabilidadSOCAP = (datosRaw) => {
    if (!datosRaw) return null;

    const limpiarNumero = (valor) => {
        if (typeof valor === 'number') return valor;
        if (typeof valor === 'string') {
        return parseFloat(valor.replace(/,/g, ''));
        }
        return 0;
    };

    const datos = {
        edad_mediana: limpiarNumero(datosRaw.edad_mediana),
        poblacion_total: limpiarNumero(datosRaw.poblacion_total),
        poblacion_economicamente_activa: limpiarNumero(datosRaw.poblacion_economicamente_activa),
        viviendas_habiles: limpiarNumero(datosRaw.viviendas_habiles),
        nse_predominante: datosRaw.nse_predominante
    };

    const poblacionNoActiva = datos.poblacion_total - datos.poblacion_economicamente_activa;
    const indiceDependencia = poblacionNoActiva / datos.poblacion_economicamente_activa;

    let scoreNSE = 0;
    let scoreEdad = 0;
    let scorePEA = 0;
    let scoreDependencia = 0;

    if (datos.nse_predominante === "A/B" || datos.nse_predominante === "C+") scoreNSE = 10;
    else if (datos.nse_predominante === "C" || datos.nse_predominante === "C-") scoreNSE = 8;
    else if (datos.nse_predominante === "D+") scoreNSE = 6;
    else scoreNSE = 4;

    if (datos.edad_mediana >= 25 && datos.edad_mediana <= 35) scoreEdad = 9.5;
    else if (datos.edad_mediana > 35 && datos.edad_mediana <= 45) scoreEdad = 8;
    else scoreEdad = 6;

    if (datos.poblacion_economicamente_activa > 20000) scorePEA = 10;
    else if (datos.poblacion_economicamente_activa >= 5000 && datos.poblacion_economicamente_activa <= 20000) scorePEA = 7.5;
    else scorePEA = 5;

    if (indiceDependencia < 1.0) scoreDependencia = 10;
    else if (indiceDependencia >= 1.0 && indiceDependencia <= 1.3) scoreDependencia = 8.5;
    else if (indiceDependencia > 1.3 && indiceDependencia <= 1.8) scoreDependencia = 6;
    else scoreDependencia = 3;

    const pesos = { nse: 0.35, pea: 0.25, edad: 0.20, dependencia: 0.20 };

    const scoreFinal = 
        (scoreNSE * pesos.nse) + 
        (scorePEA * pesos.pea) + 
        (scoreEdad * pesos.edad) + 
        (scoreDependencia * pesos.dependencia);

    let viabilidadFinal = (scoreFinal / 10) * 100;
    let alertas = "Sin restricciones críticas.";
    
    if (datos.poblacion_economicamente_activa < 1500) {
        viabilidadFinal = viabilidadFinal * 0.4;
        alertas = "ALERTA: PEA demasiado baja para sucursal física.";
    }

    const sugerenciaProducto = (indiceDependencia >= 1.0 && scoreNSE >= 8)
        ? "Créditos Educativos, Seguros Familiares y Cuentas de Ahorro Infantil."
        : "Microcréditos productivos y consumo corriente.";

    return {
        probabilidad: viabilidadFinal.toFixed(1),
        indiceDependencia: indiceDependencia.toFixed(2),
        poblacionNoActiva,
        diagnostico: viabilidadFinal >= 80 ? "Alta" : viabilidadFinal >= 60 ? "Media" : "Baja",
        sugerenciaProducto,
        alertas
    };
};