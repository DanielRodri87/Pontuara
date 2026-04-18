from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.schemas.expediente import ExpedienteCreate, ExpedienteRead, ExpedienteUpdate
from app.services.supabase import supabase_service

router = APIRouter(prefix="/expedientes", tags=["expedientes"])


@router.post("/", response_model=ExpedienteRead, status_code=status.HTTP_201_CREATED)
def create_expediente(payload: ExpedienteCreate) -> ExpedienteRead:
    """Cria um expediente no Supabase.

    Args:
        payload: Dados de entrada para criação do expediente.

    Returns:
        ExpedienteRead: Expediente criado com identificador gerado.
    """
    expediente = supabase_service.create_row(
        settings.supabase_expedientes_table,
        payload.model_dump(mode="json"),
    )
    return ExpedienteRead.model_validate(expediente)


@router.get("/", response_model=list[ExpedienteRead])
def list_expedientes() -> list[ExpedienteRead]:
    """Lista os expedientes cadastrados no Supabase.

    Args:
        None.

    Returns:
        list[ExpedienteRead]: Coleção de expedientes cadastrados.
    """
    expedientes = supabase_service.list_rows(settings.supabase_expedientes_table)
    return [ExpedienteRead.model_validate(expediente) for expediente in expedientes]


@router.get("/{expediente_id}", response_model=ExpedienteRead)
def get_expediente(expediente_id: UUID) -> ExpedienteRead:
    """Busca um expediente por identificador.

    Args:
        expediente_id: Identificador UUID do expediente.

    Returns:
        ExpedienteRead: Expediente encontrado.
    """
    expediente = supabase_service.get_row(settings.supabase_expedientes_table, expediente_id)
    return ExpedienteRead.model_validate(expediente)


@router.put("/{expediente_id}", response_model=ExpedienteRead)
def update_expediente(expediente_id: UUID, payload: ExpedienteUpdate) -> ExpedienteRead:
    """Atualiza parcialmente um expediente no Supabase.

    Args:
        expediente_id: Identificador UUID do expediente.
        payload: Dados parciais para atualização do expediente.

    Returns:
        ExpedienteRead: Expediente atualizado.

    Raises:
        HTTPException: Quando o expediente não é encontrado.
    """
    atualizacoes = payload.model_dump(mode="json", exclude_unset=True)
    if not atualizacoes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nenhum campo enviado para atualização")
    expediente = supabase_service.update_row(settings.supabase_expedientes_table, expediente_id, atualizacoes)
    return ExpedienteRead.model_validate(expediente)


@router.delete("/{expediente_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expediente(expediente_id: UUID) -> None:
    """Remove um expediente no Supabase.

    Args:
        expediente_id: Identificador UUID do expediente.

    Returns:
        None: Resposta sem conteúdo quando a remoção é concluída.

    Raises:
        HTTPException: Quando o expediente não é encontrado.
    """
    supabase_service.delete_row(settings.supabase_expedientes_table, expediente_id)
    return None
