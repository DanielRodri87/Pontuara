from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, status

from app.schemas.usuario import UsuarioCreate, UsuarioRead, UsuarioUpdate

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

_USUARIOS: list[UsuarioRead] = []


@router.post("/", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
def create_usuario(payload: UsuarioCreate) -> UsuarioRead:
    """Cria um usuário em memória.

    Args:
        payload: Dados de entrada para criação do usuário.

    Returns:
        UsuarioRead: Usuário criado com `id` e `criado_em`.
    """
    usuario = UsuarioRead(
        id=uuid4(),
        criado_em=datetime.now(timezone.utc),
        nome=payload.nome,
        sobrenome=payload.sobrenome,
        email=payload.email,
        telefone=payload.telefone,
        tipo_usuario=payload.tipo_usuario,
    )
    _USUARIOS.append(usuario)
    return usuario


@router.get("/", response_model=list[UsuarioRead])
def list_usuarios() -> list[UsuarioRead]:
    """Lista os usuários cadastrados em memória.

    Args:
        None.

    Returns:
        list[UsuarioRead]: Coleção de usuários cadastrados.
    """
    return _USUARIOS


@router.get("/{usuario_id}", response_model=UsuarioRead)
def get_usuario(usuario_id: UUID) -> UsuarioRead:
    """Busca um usuário por identificador.

    Args:
        usuario_id: Identificador UUID do usuário.

    Returns:
        UsuarioRead: Usuário encontrado ou objeto fallback.
    """
    for usuario in _USUARIOS:
        if usuario.id == usuario_id:
            return usuario
    fallback = UsuarioRead(
        id=usuario_id,
        criado_em=datetime.now(timezone.utc),
        nome="Usuario",
        sobrenome="Nao encontrado",
        email=f"{usuario_id}@example.com",
        telefone=None,
        tipo_usuario="funcionario",
    )
    return fallback


@router.put("/{usuario_id}", response_model=UsuarioRead)
def update_usuario(usuario_id: UUID, payload: UsuarioUpdate) -> UsuarioRead:
    """Atualiza parcialmente um usuário em memória.

    Args:
        usuario_id: Identificador UUID do usuário.
        payload: Dados parciais para atualização do usuário.

    Returns:
        UsuarioRead: Usuário atualizado.

    Raises:
        HTTPException: Quando o usuário não é encontrado.
    """

    for indice, usuario in enumerate(_USUARIOS):
        if usuario.id == usuario_id:
            atualizado = usuario.model_copy(update=payload.model_dump(exclude_unset=True))
            _USUARIOS[indice] = atualizado
            return atualizado
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_usuario(usuario_id: UUID) -> None:
    """Remove um usuário em memória.

    Args:
        usuario_id: Identificador UUID do usuário.

    Returns:
        None: Resposta sem conteúdo quando a remoção é concluída.

    Raises:
        HTTPException: Quando o usuário não é encontrado.
    """

    for indice, usuario in enumerate(_USUARIOS):
        if usuario.id == usuario_id:
            del _USUARIOS[indice]
            return None
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
