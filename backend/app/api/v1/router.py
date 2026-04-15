from fastapi import APIRouter

from app.api.v1.endpoints import expedientes, trabalhos, usuarios

api_router = APIRouter()
api_router.include_router(usuarios.router)
api_router.include_router(trabalhos.router)
api_router.include_router(expedientes.router)
