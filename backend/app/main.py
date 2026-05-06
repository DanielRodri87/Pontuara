import logging
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings

from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_name,
    description="API inicial do projeto Pontuara.",
    version=settings.app_version,
)

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, você deve especificar as origens permitidas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["health"])
def healthcheck() -> dict[str, str]:
    """Retorna o status básico da API.

    Args:
        None.

    Returns:
        dict[str, str]: Resposta de saúde da aplicação.
    """
    return {
        "status": "ok",
        "supabase_configured": "true" if settings.supabase_configured else "false",
    }
