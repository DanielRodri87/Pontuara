from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

TipoUsuario = Literal["funcionario", "empregador"]


class UsuarioBase(BaseModel):
    """Define shared fields for the user domain.

    Args:
        nome: User first name.
        sobrenome: User last name.
        email: Valid user email.
        telefone: Optional user phone.
        tipo_usuario: User role (`funcionario` or `empregador`).

    Returns:
        None: Schema class for validation and serialization.
    """

    nome: str = Field(min_length=1)
    sobrenome: str = Field(min_length=1)
    email: EmailStr
    telefone: str | None = None
    tipo_usuario: TipoUsuario
    idempresa: UUID | None = None
    pendente: bool = False
    foto_url: str | None = None


class UsuarioCreate(UsuarioBase):
    """Define input payload for user creation."""

    id: UUID | None = None


class UsuarioUpdate(BaseModel):
    """Define input payload for partial user updates.

    Args:
        nome: Optional user first name.
        sobrenome: Optional user last name.
        email: Optional user email.
        telefone: Optional user phone.
        tipo_usuario: Optional user role.

    Returns:
        None: Schema class for update validation.
    """

    nome: str | None = Field(default=None, min_length=1)
    sobrenome: str | None = Field(default=None, min_length=1)
    email: EmailStr | None = None
    telefone: str | None = None
    tipo_usuario: TipoUsuario | None = None
    idempresa: UUID | None = None
    pendente: bool | None = None
    foto_url: str | None = None


class UsuarioRead(UsuarioBase):
    """Define output payload for user reads.

    Args:
        id: User UUID identifier.
        criado_em: Record creation timestamp.

    Returns:
        None: Schema class for response serialization.
    """

    id: UUID
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)
