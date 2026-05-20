from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class EmpresaBase(BaseModel):
    """Define campos compartilhados do domínio de empresa."""

    nome: str = Field(min_length=1)
    codigoempresa: str = Field(min_length=1)


class EmpresaCreate(EmpresaBase):
    """Define payload de entrada para criação de empresa."""

    pass


class EmpresaUpdate(BaseModel):
    """Define payload de entrada para atualização parcial de empresa."""

    nome: str | None = Field(default=None, min_length=1)
    codigoempresa: str | None = Field(default=None, min_length=1)


class EmpresaRead(EmpresaBase):
    """Define payload de saída para leitura de empresa."""

    id: UUID

    model_config = ConfigDict(from_attributes=True)
