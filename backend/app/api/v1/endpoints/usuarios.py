from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.schemas.usuario import UsuarioCreate, UsuarioRead, UsuarioUpdate
from app.services.supabase import supabase_service

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.post("/", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
def create_usuario(payload: UsuarioCreate) -> UsuarioRead:
    """Create a user in Supabase.

    Args:
        payload: Input data for user creation.

    Returns:
        UsuarioRead: Created user with `id` and `criado_em`.
    """
    usuario = supabase_service.create_row(
        settings.supabase_usuarios_table,
        payload.model_dump(mode="json", exclude_none=True),
    )
    return UsuarioRead.model_validate(usuario)


@router.get("/", response_model=list[UsuarioRead])
def list_usuarios() -> list[UsuarioRead]:
    """List users registered in Supabase.

    Args:
        None.

    Returns:
        list[UsuarioRead]: Collection of registered users.
    """
    usuarios = supabase_service.list_rows(settings.supabase_usuarios_table)
    return [UsuarioRead.model_validate(usuario) for usuario in usuarios]


@router.get("/{usuario_id}", response_model=UsuarioRead)
def get_usuario(usuario_id: UUID) -> UsuarioRead:
    """Fetch a user by identifier.

    Args:
        usuario_id: User UUID identifier.

    Returns:
        UsuarioRead: User found.
    """
    usuario = supabase_service.get_row(settings.supabase_usuarios_table, usuario_id)
    return UsuarioRead.model_validate(usuario)


@router.put("/{usuario_id}", response_model=UsuarioRead)
def update_usuario(usuario_id: UUID, payload: UsuarioUpdate) -> UsuarioRead:
    """Partially update a user in Supabase.

    Args:
        usuario_id: User UUID identifier.
        payload: Partial data to update the user.

    Returns:
        UsuarioRead: Updated user.

    Raises:
        HTTPException: When the user is not found.
    """
    atualizacoes = payload.model_dump(mode="json", exclude_unset=True)
    if not atualizacoes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nenhum campo enviado para atualização")
    usuario = supabase_service.update_row(settings.supabase_usuarios_table, usuario_id, atualizacoes)
    return UsuarioRead.model_validate(usuario)


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_usuario(usuario_id: UUID) -> None:
    """Remove a user in Supabase.

    Args:
        usuario_id: User UUID identifier.

    Returns:
        None: No-content response when deletion completes.

    Raises:
        HTTPException: When the user is not found.
    """
    supabase_service.delete_row(settings.supabase_usuarios_table, usuario_id)
    return None
