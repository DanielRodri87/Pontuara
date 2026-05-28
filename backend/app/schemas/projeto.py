from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProjetoBase(BaseModel):
    """Define shared fields for the project domain."""

    titulo: str = Field(min_length=1)
    descricao: str | None = None
    badgets: Decimal | None = None
    idempresa: UUID | None = None


class ProjetoCreate(ProjetoBase):
    """Define input payload for project creation."""

    pass


class ProjetoUpdate(BaseModel):
    """Define input payload for partial project updates."""

    titulo: str | None = Field(default=None, min_length=1)
    descricao: str | None = None
    badgets: Decimal | None = None
    idempresa: UUID | None = None


class ProjetoRead(ProjetoBase):
    """Define output payload for project reads."""

    id: UUID

    model_config = ConfigDict(from_attributes=True)
