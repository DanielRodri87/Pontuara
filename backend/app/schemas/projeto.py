from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProjetoBase(BaseModel):
    """Define campos compartilhados do domínio de projeto."""

    titulo: str = Field(min_length=1)
    descricao: str | None = None
    badgets: Decimal | None = None
    idempresa: UUID | None = None


class ProjetoCreate(ProjetoBase):
    """Define payload de entrada para criação de projeto."""

    pass


class ProjetoUpdate(BaseModel):
    """Define payload de entrada para atualização parcial de projeto."""

    titulo: str | None = Field(default=None, min_length=1)
    descricao: str | None = None
    badgets: Decimal | None = None
    idempresa: UUID | None = None


class ProjetoRead(ProjetoBase):
    """Define payload de saída para leitura de projeto."""

    id: UUID

    model_config = ConfigDict(from_attributes=True)
