# SOCAP Geomarket

### 1. Clonar el repositorio
```bash
git clone <tu-repo>
cd socap-geomarket-api
```

### 2. Crear entorno virtual
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate  # Windows
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno
Copia `.env.example` a `.env` y actualiza los valores:
```bash
cp .env.example .env
```

```env
TOKEN_INEGI=tu_token_aqui
CORS_ORIGIN=http://localhost:5173
DATABASE_FILE=datosDemograficos.json
INGRESOS_FILE=datosIngresos.json
ENV=development
```

### 5. Colocar archivos de datos
Asegúrate de que estos archivos existan en la raíz:
- `datosDemograficos.json`
- `datosIngresos.json`

## ▶️ Ejecutar en Desarrollo

```bash
uvicorn main:app --reload
```

El servidor estará disponible en: **http://localhost:8000**

### Documentación interactiva
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔗 Endpoints principales

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/health` | GET | Chequeo de salud |
| `/ready` | GET | Verificar si datos están cargados |
| `/api/estados` | GET | Lista de estados |
| `/api/municipios/{estado}` | GET | Municipios de un estado |
| `/api/localidades/{estado}/{municipio}` | GET | Localidades de un municipio |
| `/api/localidad-cercana` | GET | Encuentra la localidad más cercana |
| `/api/finder` | GET | Busca localidades por nombre |
| `/api/ingresos` | GET | Datos de ingresos por estado |
| `/api/analizar` | GET | Análisis detallado de zona (DENUE) |

## 📊 Ejemplo de uso

### Buscar localidad cercana
```bash
curl "http://localhost:8000/api/localidad-cercana?lat=22.2709&lon=-100.9855"
```

### Analizar zona
```bash
curl "http://localhost:8000/api/analizar?lat=22.2709&lon=-100.9855&radio=2000&palabra=todos"
```

## 🛠️ Tecnología

- **FastAPI** - Framework web asincrónico
- **Uvicorn** - Servidor ASGI
- **Pydantic** - Validación de datos
- **Requests** - Cliente HTTP para INEGI API
- **python-dotenv** - Manejo de variables de entorno

## 📝 Logs

Los logs se muestran en consola y pueden verse en `/logs/` si está configurado.

Formato:
```
2024-01-15 10:30:45,123 - __main__ - INFO - ✅ Cargadas 5234 localidades
```

## 🚨 Solución de problemas

### Error: "TOKEN_INEGI no configurado"
- Verifica que `.env` existe en la raíz del proyecto
- Confirma que `TOKEN_INEGI` está completo y sin espacios

### Error: "Archivo de datos no encontrado"
- Coloca `datosDemograficos.json` y `datosIngresos.json` en la raíz

### CORS bloqueado
- Revisa `CORS_ORIGIN` en `.env`
- En desarrollo debería ser `http://localhost:5173`

## 🌐 Despliegue en Producción

Ver archivo `Dockerfile` para crear imagen Docker.

```bash
docker build -t socap-api .
docker run -p 8000:8000 --env-file .env.production socap-api
```

## 📄 Licencia
Privado - José Alfredo López Mares

---