from fastapi import APIRouter, Depends

from app.api.v1.endpoints import auth, empresas, projetos, trabalhos, usuarios
from app.core.security import get_current_user

api_router = APIRouter()

# Rotas de autenticação são públicas (login, signup, recuperação de senha).
api_router.include_router(auth.router)

# Demais rotas exigem um Bearer token válido do Supabase.
protected = [Depends(get_current_user)]
api_router.include_router(empresas.router, dependencies=protected)
api_router.include_router(projetos.router, dependencies=protected)
api_router.include_router(usuarios.router, dependencies=protected)
api_router.include_router(trabalhos.router, dependencies=protected)
