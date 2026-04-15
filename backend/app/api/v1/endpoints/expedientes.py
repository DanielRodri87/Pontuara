from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, status

from app.schemas.expediente import ExpedienteCreate, ExpedienteRead

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
