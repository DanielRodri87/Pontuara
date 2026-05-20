from fastapi import APIRouter
from app.api.v1.endpoints import auth, empresas, projetos, trabalhos, usuarios

api_router = APIRouter()
api_router.include_router(empresas.router)
api_router.include_router(projetos.router)
api_router.include_router(usuarios.router)
api_router.include_router(trabalhos.router)
api_router.include_router(auth.router)
