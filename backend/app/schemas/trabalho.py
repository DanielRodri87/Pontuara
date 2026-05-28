from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TrabalhoBase(BaseModel):
    """Define shared fields for the job domain.

    Args:
        empregador_id: Employer UUID identifier.
        titulo: Job title.
        descricao: Optional job description.
        categoria: Optional job category.
        idprojeto: Optional project UUID identifier.
        duracao: Optional duration in a format accepted by PostgreSQL interval.

    Returns:
        None: Schema class for validation and serialization.
    """

    empregador_id: UUID
    titulo: str = Field(min_length=1)
    descricao: str | None = None
    categoria: str | None = None
    idprojeto: UUID | None = None
    duracao: str | None = None


class TrabalhoCreate(TrabalhoBase):
    """Define input payload for job creation.

    Args:
        None.

    Returns:
        None: Schema class for input validation.
    """

    pass


class TrabalhoUpdate(BaseModel):
    """Define input payload for partial job updates.

    Args:
        empregador_id: Optional employer UUID identifier.
        titulo: Optional job title.
        descricao: Optional job description.
        categoria: Optional job category.
        idprojeto: Optional project UUID identifier.
        duracao: Optional duration in a format accepted by PostgreSQL interval.

    Returns:
        None: Schema class for update validation.
    """

    empregador_id: UUID | None = None
    titulo: str | None = Field(default=None, min_length=1)
    descricao: str | None = None
    categoria: str | None = None
    idprojeto: UUID | None = None
    duracao: str | None = None


class TrabalhoRead(TrabalhoBase):
    """Define output payload for job reads.

    Args:
        id: Job UUID identifier.
        criado_em: Record creation timestamp.

    Returns:
        None: Schema class for response serialization.
    """

    id: UUID
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)
