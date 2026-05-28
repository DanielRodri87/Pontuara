from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class EmpresaBase(BaseModel):
    """Define shared fields for the company domain."""

    nome: str = Field(min_length=1)
    codigoempresa: str = Field(min_length=1)


class EmpresaCreate(EmpresaBase):
    """Define input payload for company creation."""

    pass


class EmpresaUpdate(BaseModel):
    """Define input payload for partial company updates."""

    nome: str | None = Field(default=None, min_length=1)
    codigoempresa: str | None = Field(default=None, min_length=1)


class EmpresaRead(EmpresaBase):
    """Define output payload for company reads."""

    id: UUID

    model_config = ConfigDict(from_attributes=True)
