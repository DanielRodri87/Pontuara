from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, status

from app.schemas.trabalho import TrabalhoCreate, TrabalhoRead, TrabalhoUpdate

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


@router.put("/{trabalho_id}", response_model=TrabalhoRead)
def update_trabalho(trabalho_id: UUID, payload: TrabalhoUpdate) -> TrabalhoRead:
    """Atualiza parcialmente um trabalho em memória.

    Args:
        trabalho_id: Identificador UUID do trabalho.
        payload: Dados parciais para atualização do trabalho.

    Returns:
        TrabalhoRead: Trabalho atualizado.

    Raises:
        HTTPException: Quando o trabalho não é encontrado.
    """

    for indice, trabalho in enumerate(_TRABALHOS):
        if trabalho.id == trabalho_id:
            atualizado = trabalho.model_copy(update=payload.model_dump(exclude_unset=True))
            _TRABALHOS[indice] = atualizado
            return atualizado
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trabalho não encontrado")


@router.delete("/{trabalho_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trabalho(trabalho_id: UUID) -> None:
    """Remove um trabalho em memória.

    Args:
        trabalho_id: Identificador UUID do trabalho.

    Returns:
        None: Resposta sem conteúdo quando a remoção é concluída.

    Raises:
        HTTPException: Quando o trabalho não é encontrado.
    """

    for indice, trabalho in enumerate(_TRABALHOS):
        if trabalho.id == trabalho_id:
            del _TRABALHOS[indice]
            return None
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trabalho não encontrado")
