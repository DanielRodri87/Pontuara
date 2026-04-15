from fastapi import FastAPI

from app.api.v1.router import api_router

app = FastAPI(
    title="Pontuara API",
    description="API inicial do projeto Pontuara.",
    version="0.1.0",
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
    return {"status": "ok"}
