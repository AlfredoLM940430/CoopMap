from http.client import BadStatusLine

import requests
from fastapi import APIRouter, Depends, HTTPException, Query
from requests.exceptions import ConnectionError, Timeout

from app.auth import get_current_user
from app.config import TOKEN_INEGI, logger
from app.utils import PATRON_FINANCIERO, PATRON_EXCLUSION, obtener_peso_estrato

router = APIRouter(prefix="/api", tags=["denue"])

@router.get("/analizar")
def analizar_zona(
    lat: float = Query(..., description="Latitud de búsqueda"),
    lon: float = Query(..., description="Longitud de búsqueda"),
    radio: int = Query(2000, description="Radio en metros"),
    palabra: str = Query("todos", description="Filtro para el DENUE"),
    user: dict = Depends(get_current_user),
):
    if not TOKEN_INEGI:
        logger.error("TOKEN_INEGI no está configurado")
        raise HTTPException(status_code=500, detail="Token de INEGI no configurado")

    url = f"https://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar/{palabra}/{lat},{lon}/{radio}/{TOKEN_INEGI}"

    try:
        response = requests.get(url, timeout=12)
        if response.status_code != 200:
            logger.warning(f"INEGI retornó status {response.status_code}")
            raise HTTPException(status_code=502, detail="Error al conectar con el DENUE")

        try:
            registros = response.json()
        except Exception:
            logger.warning("INEGI retornó una respuesta vacía o no JSON con código 200")
            return {
                "status": "success",
                "resumen": {"total_comercios": 0, "total_competidores": 0},
                "competidores": [],
                "comercios": [],
            }

        if not isinstance(registros, list):
            return {"competidores": [], "comercios": [], "total_demografico": 0}

        competidores = []
        comercios = []

        for item in registros:
            nombre = str(item.get("Nombre", "")).lower()
            giro_real = item.get("Clase") or item.get("Clase_actividad") or "No especificado"
            estrato_personal = item.get("Estrato", "No especificado")

            entidad = {
                "id": item.get("Id"),
                "nombre": item.get("Nombre"),
                "giro": giro_real,
                "direccion": f"{item.get('Calle', '')} {item.get('Numero_exterior', '') or ''}, Col. {item.get('Colonia', '')}",
                "latitud": float(item.get("Latitud", 0)),
                "longitud": float(item.get("Longitud", 0)),
                "personal": estrato_personal,
                "razon_social": item.get("Razon_social") or "Sin datos en DENUE",
                "telefono": item.get("Telefono") or "Sin datos en DENUE",
                "correo": item.get("Correo_e") or "Sin datos en DENUE",
                "sitio_web": item.get("Sitio_internet") or "Sin datos en DENUE",
                "_peso": obtener_peso_estrato(estrato_personal),
            }

            es_financiero = PATRON_FINANCIERO.search(nombre) or PATRON_FINANCIERO.search(giro_real)
            es_falso_positivo = PATRON_EXCLUSION.search(nombre) or PATRON_EXCLUSION.search(giro_real)

            if es_financiero and not es_falso_positivo:
                competidores.append(entidad)
            else:
                comercios.append(entidad)

        competidores_ordenados = sorted(competidores, key=lambda x: x["_peso"], reverse=True)
        comercios_ordenados = sorted(comercios, key=lambda x: x["_peso"], reverse=True)

        for c in competidores_ordenados:
            c.pop("_peso", None)
        for c in comercios_ordenados:
            c.pop("_peso", None)

        total_com = len(comercios_ordenados)

        logger.info(
            f"Análisis completado: {total_com} comercios, {len(competidores_ordenados)} competidores"
        )

        return {
            "status": "success",
            "resumen": {
                "total_comercios": total_com,
                "total_competidores": len(competidores_ordenados),
            },
            "competidores": competidores_ordenados,
            "comercios": comercios_ordenados,
        }

    except HTTPException:
        raise
    except (ConnectionError, BadStatusLine) as e:
        logger.warning(f"Conexión abortada por el INEGI: {e}")
        return {
            "status": "success",
            "resumen": {"total_comercios": 0, "total_competidores": 0},
            "competidores": [],
            "comercios": [],
        }
    except Timeout:
        logger.error("Timeout: La API de INEGI tardó demasiado")
        raise HTTPException(status_code=504, detail="La API de INEGI tardó demasiado en responder")
    except Exception as e:
        logger.error(f"Error inesperado: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error inesperado: {str(e)}")