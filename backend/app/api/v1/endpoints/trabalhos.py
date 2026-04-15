from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, status

from app.schemas.trabalho import TrabalhoCreate, TrabalhoRead

router = APIRouter(prefix="/trabalhos", tags=["trabalhos"])

_TRABALHOS: list[TrabalhoRead] = []


@router.post("/", response_model=TrabalhoRead, status_code=status.HTTP_201_CREATED)
def create_trabalho(payload: TrabalhoCreate) -> TrabalhoRead:
    """Cria um trabalho em memória.

    Args:
        payload: Dados de entrada para criação do trabalho.

    Returns:
        TrabalhoRead: Trabalho criado com `id` e `criado_em`.
    """
    trabalho = TrabalhoRead(
        id=uuid4(),
        criado_em=datetime.now(timezone.utc),
        empregador_id=payload.empregador_id,
        titulo=payload.titulo,
        descricao=payload.descricao,
        categoria=payload.categoria,
        projeto=payload.projeto,
    )
    _TRABALHOS.append(trabalho)
    return trabalho


@router.get("/", response_model=list[TrabalhoRead])
def list_trabalhos() -> list[TrabalhoRead]:
    """Lista os trabalhos cadastrados em memória.

    Args:
        None.

    Returns:
        list[TrabalhoRead]: Coleção de trabalhos cadastrados.
    """
    return _TRABALHOS


@router.get("/{trabalho_id}", response_model=TrabalhoRead)
def get_trabalho(trabalho_id: UUID) -> TrabalhoRead:
    """Busca um trabalho por identificador.

    Args:
        trabalho_id: Identificador UUID do trabalho.

    Returns:
        TrabalhoRead: Trabalho encontrado ou objeto fallback.
    """
    for trabalho in _TRABALHOS:
        if trabalho.id == trabalho_id:
            return trabalho
    fallback = TrabalhoRead(
        id=trabalho_id,
        criado_em=datetime.now(timezone.utc),
        empregador_id=uuid4(),
        titulo="Trabalho nao encontrado",
        descricao=None,
        categoria=None,
        projeto=None,
    )
    return fallback
