from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

TipoUsuario = Literal["funcionario", "empregador"]


class UsuarioBase(BaseModel):
    """Define campos compartilhados do domínio de usuário.

    Args:
        nome: Nome do usuário.
        sobrenome: Sobrenome do usuário.
        email: E-mail válido do usuário.
        telefone: Telefone opcional do usuário.
        tipo_usuario: Perfil do usuário (`funcionario` ou `empregador`).

    Returns:
        None: Classe de schema para validação e serialização.
    """

    nome: str = Field(min_length=1)
    sobrenome: str = Field(min_length=1)
    email: EmailStr
    telefone: str | None = None
    tipo_usuario: TipoUsuario


class UsuarioCreate(UsuarioBase):
    """Define payload de entrada para criação de usuário.

    Args:
        senha: Senha em texto com tamanho mínimo de 6 caracteres.

    Returns:
        None: Classe de schema para validação de entrada.
    """

    senha: str = Field(min_length=6, max_length=255)


class UsuarioRead(UsuarioBase):
    """Define payload de saída para leitura de usuário.

    Args:
        id: Identificador UUID do usuário.
        criado_em: Data e hora de criação do registro.

    Returns:
        None: Classe de schema para serialização de resposta.
    """

    id: UUID
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)
