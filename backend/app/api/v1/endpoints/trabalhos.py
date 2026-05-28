from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.schemas.trabalho import TrabalhoCreate, TrabalhoRead, TrabalhoUpdate
from app.services.supabase import supabase_service

router = APIRouter(prefix="/trabalhos", tags=["trabalhos"])


@router.post("/", response_model=TrabalhoRead, status_code=status.HTTP_201_CREATED)
def create_trabalho(payload: TrabalhoCreate) -> TrabalhoRead:
    """Create a job in Supabase.

    Args:
        payload: Input data for job creation.

    Returns:
        TrabalhoRead: Created job with `id` and `criado_em`.
    """
    trabalho = supabase_service.create_row(
        settings.supabase_trabalhos_table,
        payload.model_dump(mode="json", exclude_none=True),
    )
    return TrabalhoRead.model_validate(trabalho)


@router.get("/", response_model=list[TrabalhoRead])
def list_trabalhos() -> list[TrabalhoRead]:
    """List jobs registered in Supabase.

    Args:
        None.

    Returns:
        list[TrabalhoRead]: Collection of registered jobs.
    """
    trabalhos = supabase_service.list_rows(settings.supabase_trabalhos_table)
    return [TrabalhoRead.model_validate(trabalho) for trabalho in trabalhos]


@router.get("/{trabalho_id}", response_model=TrabalhoRead)
def get_trabalho(trabalho_id: UUID) -> TrabalhoRead:
    """Fetch a job by identifier.

    Args:
        trabalho_id: Job UUID identifier.

    Returns:
        TrabalhoRead: Job found.
    """
    trabalho = supabase_service.get_row(settings.supabase_trabalhos_table, trabalho_id)
    return TrabalhoRead.model_validate(trabalho)


@router.put("/{trabalho_id}", response_model=TrabalhoRead)
def update_trabalho(trabalho_id: UUID, payload: TrabalhoUpdate) -> TrabalhoRead:
    """Partially update a job in Supabase.

    Args:
        trabalho_id: Job UUID identifier.
        payload: Partial data to update the job.

    Returns:
        TrabalhoRead: Updated job.

    Raises:
        HTTPException: When the job is not found.
    """
    atualizacoes = payload.model_dump(mode="json", exclude_unset=True)
    if not atualizacoes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nenhum campo enviado para atualização")
    trabalho = supabase_service.update_row(settings.supabase_trabalhos_table, trabalho_id, atualizacoes)
    return TrabalhoRead.model_validate(trabalho)


@router.delete("/{trabalho_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trabalho(trabalho_id: UUID) -> None:
    """Remove a job in Supabase.

    Args:
        trabalho_id: Job UUID identifier.

    Returns:
        None: No-content response when deletion completes.

    Raises:
        HTTPException: When the job is not found.
    """
    supabase_service.delete_row(settings.supabase_trabalhos_table, trabalho_id)
    return None
