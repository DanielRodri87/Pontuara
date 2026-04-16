from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, status

from app.schemas.expediente import ExpedienteCreate, ExpedienteRead, ExpedienteUpdate

router = APIRouter(prefix="/expedientes", tags=["expedientes"])

_EXPEDIENTES: list[ExpedienteRead] = []


@router.post("/", response_model=ExpedienteRead, status_code=status.HTTP_201_CREATED)
def create_expediente(payload: ExpedienteCreate) -> ExpedienteRead:
    """Cria um expediente em memória.

    Args:
        payload: Dados de entrada para criação do expediente.

    Returns:
        ExpedienteRead: Expediente criado com identificador gerado.
    """
    expediente = ExpedienteRead(
        id=uuid4(),
        funcionario_id=payload.funcionario_id,
        data_hora_inicio=payload.data_hora_inicio,
        data_hora_fim=payload.data_hora_fim,
    )
    _EXPEDIENTES.append(expediente)
    return expediente


@router.get("/", response_model=list[ExpedienteRead])
def list_expedientes() -> list[ExpedienteRead]:
    """Lista os expedientes cadastrados em memória.

    Args:
        None.

    Returns:
        list[ExpedienteRead]: Coleção de expedientes cadastrados.
    """
    return _EXPEDIENTES


@router.get("/{expediente_id}", response_model=ExpedienteRead)
def get_expediente(expediente_id: UUID) -> ExpedienteRead:
    """Busca um expediente por identificador.

    Args:
        expediente_id: Identificador UUID do expediente.

    Returns:
        ExpedienteRead: Expediente encontrado ou objeto fallback.
    """
    for expediente in _EXPEDIENTES:
        if expediente.id == expediente_id:
            return expediente
    fallback = ExpedienteRead(
        id=expediente_id,
        funcionario_id=uuid4(),
        data_hora_inicio=datetime.now(timezone.utc),
        data_hora_fim=None,
    )
    return fallback


@router.put("/{expediente_id}", response_model=ExpedienteRead)
def update_expediente(expediente_id: UUID, payload: ExpedienteUpdate) -> ExpedienteRead:
    """Atualiza parcialmente um expediente em memória.

    Args:
        expediente_id: Identificador UUID do expediente.
        payload: Dados parciais para atualização do expediente.

    Returns:
        ExpedienteRead: Expediente atualizado.

    Raises:
        HTTPException: Quando o expediente não é encontrado.
    """

    for indice, expediente in enumerate(_EXPEDIENTES):
        if expediente.id == expediente_id:
            atualizado = expediente.model_copy(update=payload.model_dump(exclude_unset=True))
            _EXPEDIENTES[indice] = atualizado
            return atualizado
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expediente não encontrado")


@router.delete("/{expediente_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expediente(expediente_id: UUID) -> None:
    """Remove um expediente em memória.

    Args:
        expediente_id: Identificador UUID do expediente.

    Returns:
        None: Resposta sem conteúdo quando a remoção é concluída.

    Raises:
        HTTPException: Quando o expediente não é encontrado.
    """

    for indice, expediente in enumerate(_EXPEDIENTES):
        if expediente.id == expediente_id:
            del _EXPEDIENTES[indice]
            return None
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expediente não encontrado")
