import json
import math
import re

from fastapi import HTTPException

from app.config import BASE_DIR, FILE_INGRESOS

PATRON_FINANCIERO = re.compile(
    r"(banco|sofipo|sofom|cooperativa de ahorro|caja popular|caja de ahorro|prestamos|credito|financiera)"
)
PATRON_EXCLUSION = re.compile(
    r"(farmacia|escolar|preparatoria|primaria|calzado|zapateria|botanico|naturista|celulares|cafeteria|cyber|abarrotes|alimentos|sangre|organos)"
)

# Mapeo directo en vez de comparaciones de substring frágiles
PESOS_ESTRATO = {
    "0 a 5": 1,
    "6 a 10": 2,
    "11 a 30": 3,
    "31 a 50": 4,
    "51 a 100": 5,
    "101 a 250": 6,
    "251 o más": 7,
    "251 o mas": 7,
}


def calcular_distancia(lat1, lon1, lat2, lon2) -> float:
    """Distancia Haversine en km entre dos coordenadas."""
    R = 6371.0
    rad_lat1, rad_lon1, rad_lat2, rad_lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = rad_lat2 - rad_lat1
    dlon = rad_lon2 - rad_lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(rad_lat1) * math.cos(rad_lat2) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def obtener_peso_estrato(estrato: str) -> int:
    if not estrato:
        return 0
    estrato_limpio = str(estrato).lower().strip()
    for clave, peso in PESOS_ESTRATO.items():
        if clave in estrato_limpio:
            return peso
    return 0


def cargar_datos_ingresos_json() -> dict:
    path_ingresos = BASE_DIR / FILE_INGRESOS
    if not path_ingresos.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Archivo '{FILE_INGRESOS}' no encontrado en el servidor.",
        )
    try:
        with open(path_ingresos, "r", encoding="utf-8") as file:
            return json.load(file)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="Error al decodificar el archivo JSON de ingresos.",
        )