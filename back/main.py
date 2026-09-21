from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGIN, ENV, supabase, logger
from app.routers import ingresos, localidades, denue

app = FastAPI(title="SOCAP Geomarket API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGIN,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(ingresos.router)
app.include_router(localidades.router)
app.include_router(denue.router)

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0", "env": ENV}


@app.get("/ready")
def readiness():
    try:
        response = supabase.table("localidades").select("id", count="exact").limit(1).execute()
        count = response.count if response.count is not None else 0
        return {"status": "ready", "localidades": count}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Supabase no disponible: {str(e)}")
