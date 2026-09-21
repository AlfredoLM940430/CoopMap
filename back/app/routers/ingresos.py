from fastapi import APIRouter, Depends, HTTPException, Query

from app.auth import get_current_user
from app.utils import cargar_datos_ingresos_json

router = APIRouter(prefix="/api", tags=["ingresos"])


@router.get("/ingresos")
def obtener_ingresos_por_estado(
    estado: str = Query(..., description="Nombre del estado a buscar"),
    user: dict = Depends(get_current_user),
):
    datos = cargar_datos_ingresos_json()
    estado_normalizado = estado.strip()

    if estado_normalizado in datos:
        return datos[estado_normalizado]

    datos_keys_lower = {k.lower(): k for k in datos.keys()}
    if estado_normalizado.lower() in datos_keys_lower:
        real_key = datos_keys_lower[estado_normalizado.lower()]
        return datos[real_key]

    raise HTTPException(
        status_code=404,
        detail=f"El estado '{estado}' no se encuentra en la base de datos de ingresos.",
    )