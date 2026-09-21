import time

import requests
from fastapi import Header, HTTPException, status
from jose import jwt
from jose.exceptions import JWTError

from app.config import SUPABASE_URL, SUPABASE_JWT_SECRET, logger

JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
JWKS_CACHE_TTL = 60 * 60  # 1 hora

_jwks_cache = {"keys": None, "fetched_at": 0}

def _get_jwks() -> list:
    now = time.time()
    if _jwks_cache["keys"] is None or (now - _jwks_cache["fetched_at"]) > JWKS_CACHE_TTL:
        try:
            resp = requests.get(JWKS_URL, timeout=5)
            resp.raise_for_status()
            _jwks_cache["keys"] = resp.json().get("keys", [])
            _jwks_cache["fetched_at"] = now
        except Exception as e:
            logger.error(f"No se pudo obtener el JWKS de Supabase: {e}")
            if _jwks_cache["keys"] is None:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="No se pudo validar el token (JWKS no disponible).",
                )
    return _jwks_cache["keys"]


def _find_key_for_kid(kid: str):
    for key in _get_jwks():
        if key.get("kid") == kid:
            return key
    _jwks_cache["fetched_at"] = 0
    for key in _get_jwks():
        if key.get("kid") == kid:
            return key
    return None


async def get_current_user(authorization: str = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no proporcionado. Envía 'Authorization: Bearer <token>'.",
        )

    token = authorization.removeprefix("Bearer ").strip()

    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Token malformado.")

    alg = unverified_header.get("alg")
    kid = unverified_header.get("kid")

    try:
        if alg == "HS256":
            if not SUPABASE_JWT_SECRET:
                raise HTTPException(
                    status_code=500,
                    detail="SUPABASE_JWT_SECRET no configurado para tokens HS256.",
                )
            payload = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
            )
        else:
            key = _find_key_for_kid(kid) if kid else None
            if not key:
                raise HTTPException(
                    status_code=401,
                    detail="No se encontró la llave pública para verificar el token.",
                )
            payload = jwt.decode(
                token,
                key,
                algorithms=[alg],
                audience="authenticated",
            )

        return payload

    except HTTPException:
        raise
    except JWTError as e:
        logger.warning(f"Token inválido: {e}")
        raise HTTPException(status_code=401, detail="Token inválido o expirado.")


def require_role(*roles: str):
    async def dependency(authorization: str = Header(None)) -> dict:
        user = await get_current_user(authorization)
        user_role = user.get("app_metadata", {}).get("role") or user.get("role")
        if user_role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para acceder a este recurso.",
            )
        return user

    return dependency