export const useRecomendacion = (dataDemografica, dataComercios, dataTrabajadores) => {
    
    const pea = parseInt(dataDemografica.demografia.poblacion_economicamente_activa.replace(/,/g, ''));
    const poblacionTotal = parseInt(dataDemografica.demografia.poblacion_total.replace(/,/g, ''));
    const totalComercios = dataComercios.resumen.total_comercios;
    const competidores = dataComercios.resumen.total_competidores;
    const brechaDigital = parseFloat(dataDemografica.gestion_riesgos.brecha_digital);
    
    const microComercios = (dataTrabajadores["0 a 5 personas"] || 0) + (dataTrabajadores["6 a 10 personas"] || 0);
    const porcentajeMicro = (microComercios / totalComercios) * 100;
    
    const puntosBuenos = [];
    const puntosMalos = [];
    
    if (porcentajeMicro > 80) {
        puntosBuenos.push(`Tejido empresarial ideal: El ${porcentajeMicro.toFixed(1)}% de los comercios son micro-negocios (0-10 empl.).`);
    }
    
    if (dataDemografica.demografia.nse_predominante.includes("C")) {
        puntosBuenos.push(`Nivel Socioeconómico Favorable (${dataDemografica.demografia.nse_predominante}): Garantiza una capacidad de ahorro e inversión estable para el fondeo.`);
    }
    
    if (competidores <= 3) {
        puntosBuenos.push(`Baja competencia directa: Solo se registran ${competidores} competidores para un mercado de ${totalComercios} comercios.`);
    }
    
    if (dataDemografica.gestion_riesgos.semaforo_seguridad_municipal === "Bajo" && dataDemografica.gestion_riesgos.rezago_social_localidad === "Bajo") {
        puntosBuenos.push("Entorno operativo seguro: Índices de seguridad y rezago social bajos reducen el riesgo de crédito y costos de seguridad física.");
    }
    
    if (brechaDigital > 40) {
        puntosBuenos.push(`Oportunidad tradicional: La brecha digital del ${brechaDigital}% beneficia el modelo de sucursal física frente a alternativas 100% Fintech.`);
    }
    
    if (poblacionTotal < 15000) {
        puntosMalos.push(`Mercado de escala reducida: Población total de ${dataDemografica.demografia.poblacion_total} (PEA: ${dataDemografica.demografia.poblacion_economicamente_activa}), lo que limita el techo de crecimiento a largo plazo.`);
    }
    
    if (porcentajeMicro > 95) {
        puntosMalos.push("Alta dependencia económica: El ecosistema depende casi en su totalidad del autoempleo y comercio minorista, vulnerable a crisis sectoriales locales.");
    }
    
    if (dataDemografica.gestion_riesgos.total_delitos_municipio > 800) {
        puntosMalos.push(`Historial delictivo acumulado: Registra un acumulado de ${dataDemografica.gestion_riesgos.total_delitos_municipio} delitos en el histórico. Monitorear estabilidad.`);
    }

    if (competidores >= 15) {
        puntosMalos.push(`Zona de alta competencia`);
    }
    
    const scoreDemanda = Math.min(100, ((pea / 10000) * 40) + (porcentajeMicro * 0.6));
    const scoreCompetencia = Math.max(0, (1 - (competidores / 6)) * 100);
    let scoreEntorno = 0;
    if (dataDemografica.gestion_riesgos.semaforo_seguridad_municipal === "Bajo") {
        scoreEntorno += 35;
    } else if (dataDemografica.gestion_riesgos.semaforo_seguridad_municipal === "Medio") {
        scoreEntorno += 15;
    }

    if (dataDemografica.gestion_riesgos.rezago_social_localidad === "Bajo") {
        scoreEntorno += 35;
    } else if (dataDemografica.gestion_riesgos.rezago_social_localidad === "Medio") {
        scoreEntorno += 15;
    } 
    if(poblacionTotal < 3000) {
        scoreEntorno -= 100
    }
    scoreEntorno += brechaDigital * 0.3;

    scoreEntorno = Math.min(100, scoreEntorno);
    
    const porcentajeViabilidad = ((scoreDemanda * 0.50) + (scoreCompetencia * 0.30) + (scoreEntorno * 0.20) + 4).toFixed(2);
    
    return {
        viabilidad: parseFloat(porcentajeViabilidad),
        pros: puntosBuenos,
        contras: puntosMalos,
        clasificacion: porcentajeViabilidad > 80 ? "Alta" : porcentajeViabilidad > 60 ? "Moderada" : "Baja",

        scoreDemanda,
        scoreCompetencia,
    };
}
