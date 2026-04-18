from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.schemas.usuario import UsuarioCreate, UsuarioRead, UsuarioUpdate
from app.services.supabase import supabase_service

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.post("/", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
def create_usuario(payload: UsuarioCreate) -> UsuarioRead:
    """Cria um usuário no Supabase.

    Args:
        payload: Dados de entrada para criação do usuário.

    Returns:
        UsuarioRead: Usuário criado com `id` e `criado_em`.
    """
    usuario = supabase_service.create_row(
        settings.supabase_usuarios_table,
        payload.model_dump(mode="json"),
    )
    return UsuarioRead.model_validate(usuario)


@router.get("/", response_model=list[UsuarioRead])
def list_usuarios() -> list[UsuarioRead]:
    """Lista os usuários cadastrados no Supabase.

    Args:
        None.

    Returns:
        list[UsuarioRead]: Coleção de usuários cadastrados.
    """
    usuarios = supabase_service.list_rows(settings.supabase_usuarios_table)
    return [UsuarioRead.model_validate(usuario) for usuario in usuarios]


@router.get("/{usuario_id}", response_model=UsuarioRead)
def get_usuario(usuario_id: UUID) -> UsuarioRead:
    """Busca um usuário por identificador.

    Args:
        usuario_id: Identificador UUID do usuário.

    Returns:
        UsuarioRead: Usuário encontrado.
    """
    usuario = supabase_service.get_row(settings.supabase_usuarios_table, usuario_id)
    return UsuarioRead.model_validate(usuario)


@router.put("/{usuario_id}", response_model=UsuarioRead)
def update_usuario(usuario_id: UUID, payload: UsuarioUpdate) -> UsuarioRead:
    """Atualiza parcialmente um usuário no Supabase.

    Args:
        usuario_id: Identificador UUID do usuário.
        payload: Dados parciais para atualização do usuário.

    Returns:
        UsuarioRead: Usuário atualizado.

    Raises:
        HTTPException: Quando o usuário não é encontrado.
    """
    atualizacoes = payload.model_dump(mode="json", exclude_unset=True)
    if not atualizacoes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nenhum campo enviado para atualização")
    usuario = supabase_service.update_row(settings.supabase_usuarios_table, usuario_id, atualizacoes)
    return UsuarioRead.model_validate(usuario)


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_usuario(usuario_id: UUID) -> None:
    """Remove um usuário no Supabase.

    Args:
        usuario_id: Identificador UUID do usuário.

    Returns:
        None: Resposta sem conteúdo quando a remoção é concluída.

    Raises:
        HTTPException: Quando o usuário não é encontrado.
    """
    supabase_service.delete_row(settings.supabase_usuarios_table, usuario_id)
    return None
