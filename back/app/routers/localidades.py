from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.auth import get_current_user
from app.config import supabase, logger

router = APIRouter(prefix="/api", tags=["localidades"])

MAX_RESULTADOS_FINDER = 50

@router.get("/localidad-cercana")
def obtener_localidad_cercana(
    lat: float = Query(..., description="Latitud enviada desde React"),
    lon: float = Query(..., description="Longitud enviada desde React"),
    user: dict = Depends(get_current_user),
):
    try:
        response = supabase.rpc("localidad_cercana", {"p_lat": lat, "p_lon": lon}).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="No se encontraron localidades válidas")
        resultado = response.data[0]
        resultado["distancia_km_aproximada"] = round(resultado.pop("distancia_km"), 2)
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/finder")
def obtener_localidades_finder(
    nombre: Optional[str] = Query(None, description="Nombre de la localidad a buscar"),
    user: dict = Depends(get_current_user),
):
    if not nombre or nombre.strip() == "":
        return []

    try:
        response = (
            supabase.table("localidades")
            .select("estado, municipio, localidad, coordenadas, demografia, gestion_riesgos")
            .ilike("localidad", f"%{nombre}%")
            .limit(MAX_RESULTADOS_FINDER)
            .execute()
        )
        rows = response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    resultados = [
        {
            "estado": row["estado"],
            "municipio": row["municipio"],
            "localidad": row["localidad"],
            "coordenadas": row["coordenadas"],
            "demografia": row["demografia"],
            "gestion_riesgos": row["gestion_riesgos"],
        }
        for row in rows
    ]

    logger.info(f"Búsqueda '/api/finder': '{nombre}' encontró {len(resultados)} resultados")
    return resultados


@router.get("/estados")
def obtener_estados(user: dict = Depends(get_current_user)):
    try:
        response = supabase.rpc("get_estados_unicos").execute()
        return [row["estado"] for row in response.data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/municipios/{estado}")
def obtener_municipios(estado: str, user: dict = Depends(get_current_user)):
    try:
        response = supabase.rpc("get_municipios_unicos", {"p_estado": estado}).execute()
        return [row["municipio"] for row in response.data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/localidades/{estado}/{municipio}")
def obtener_localidades(estado: str, municipio: str, user: dict = Depends(get_current_user)):
    try:
        response = (
            supabase.table("localidades")
            .select("localidad, coordenadas, demografia, gestion_riesgos")
            .ilike("estado", estado)
            .ilike("municipio", municipio)
            .execute()
        )
        return [
            {
                "localidad": row["localidad"],
                "coordenadas": row["coordenadas"],
                "demografia": row["demografia"],
                "gestion_riesgos": row["gestion_riesgos"],
            }
            for row in response.data
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))