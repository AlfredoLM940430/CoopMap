import os
import logging
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("socap")

BASE_DIR = Path(__file__).resolve().parent.parent

# --- Supabase ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SECRET_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "Faltan credenciales de Supabase (SUPABASE_URL / SUPABASE_SECRET_KEY) en el .env"
    )

if not SUPABASE_JWT_SECRET:
    logger.warning(
        "⚠️ SUPABASE_JWT_SECRET no configurado: los endpoints protegidos con auth fallarán."
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

TOKEN_INEGI = os.getenv("TOKEN_INEGI")
if not TOKEN_INEGI:
    logger.warning("⚠️ TOKEN_INEGI no configurado")

ENV = os.getenv("ENV", "development")

CORS_ORIGIN = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGIN", "http://localhost:5173").split(",")
    if origin.strip()
]

FILE_INGRESOS = os.getenv("INGRESOS_FILE", "datosIngresos.json")