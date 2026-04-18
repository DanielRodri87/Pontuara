from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.schemas.trabalho import TrabalhoCreate, TrabalhoRead, TrabalhoUpdate
from app.services.supabase import supabase_service

router = APIRouter(prefix="/trabalhos", tags=["trabalhos"])


@router.post("/", response_model=TrabalhoRead, status_code=status.HTTP_201_CREATED)
def create_trabalho(payload: TrabalhoCreate) -> TrabalhoRead:
    """Cria um trabalho no Supabase.

    Args:
        payload: Dados de entrada para criação do trabalho.

    Returns:
        TrabalhoRead: Trabalho criado com `id` e `criado_em`.
    """
    trabalho = supabase_service.create_row(
        settings.supabase_trabalhos_table,
        payload.model_dump(mode="json"),
    )
    return TrabalhoRead.model_validate(trabalho)


@router.get("/", response_model=list[TrabalhoRead])
def list_trabalhos() -> list[TrabalhoRead]:
    """Lista os trabalhos cadastrados no Supabase.

    Args:
        None.

    Returns:
        list[TrabalhoRead]: Coleção de trabalhos cadastrados.
    """
    trabalhos = supabase_service.list_rows(settings.supabase_trabalhos_table)
    return [TrabalhoRead.model_validate(trabalho) for trabalho in trabalhos]


@router.get("/{trabalho_id}", response_model=TrabalhoRead)
def get_trabalho(trabalho_id: UUID) -> TrabalhoRead:
    """Busca um trabalho por identificador.

    Args:
        trabalho_id: Identificador UUID do trabalho.

    Returns:
        TrabalhoRead: Trabalho encontrado.
    """
    trabalho = supabase_service.get_row(settings.supabase_trabalhos_table, trabalho_id)
    return TrabalhoRead.model_validate(trabalho)


@router.put("/{trabalho_id}", response_model=TrabalhoRead)
def update_trabalho(trabalho_id: UUID, payload: TrabalhoUpdate) -> TrabalhoRead:
    """Atualiza parcialmente um trabalho no Supabase.

    Args:
        trabalho_id: Identificador UUID do trabalho.
        payload: Dados parciais para atualização do trabalho.

    Returns:
        TrabalhoRead: Trabalho atualizado.

    Raises:
        HTTPException: Quando o trabalho não é encontrado.
    """
    atualizacoes = payload.model_dump(mode="json", exclude_unset=True)
    if not atualizacoes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nenhum campo enviado para atualização")
    trabalho = supabase_service.update_row(settings.supabase_trabalhos_table, trabalho_id, atualizacoes)
    return TrabalhoRead.model_validate(trabalho)


@router.delete("/{trabalho_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trabalho(trabalho_id: UUID) -> None:
    """Remove um trabalho no Supabase.

    Args:
        trabalho_id: Identificador UUID do trabalho.

    Returns:
        None: Resposta sem conteúdo quando a remoção é concluída.

    Raises:
        HTTPException: Quando o trabalho não é encontrado.
    """
    supabase_service.delete_row(settings.supabase_trabalhos_table, trabalho_id)
    return None
