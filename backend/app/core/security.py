"""Utilidades de autenticação para proteger os endpoints da API.

Expõe uma dependência FastAPI que exige um Bearer token válido do Supabase em
todas as rotas protegidas. O token é validado diretamente no Supabase Auth.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.services.supabase import supabase_service

# auto_error=False para podermos devolver uma mensagem 401 consistente quando
# o cabeçalho Authorization estiver ausente.
_bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer_scheme)],
) -> dict[str, object]:
    """Valida o Bearer token e devolve o usuário autenticado.

    Args:
        credentials: Credenciais extraídas do cabeçalho `Authorization`.

    Returns:
        dict[str, object]: Dados do usuário autenticado no Supabase.

    Raises:
        HTTPException: 401 quando o token está ausente, é inválido ou expirou.
    """
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais de autenticação ausentes.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return supabase_service.get_user_from_token(credentials.credentials)


CurrentUser = Annotated[dict[str, object], Depends(get_current_user)]
