from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TrabalhoBase(BaseModel):
    """Define campos compartilhados do domínio de trabalho.

    Args:
        empregador_id: Identificador UUID do empregador.
        titulo: Título do trabalho.
        descricao: Descrição opcional do trabalho.
        categoria: Categoria opcional do trabalho.
        projeto: Nome opcional do projeto.

    Returns:
        None: Classe de schema para validação e serialização.
    """

    empregador_id: UUID
    titulo: str = Field(min_length=1)
    descricao: str | None = None
    categoria: str | None = None
    projeto: str | None = None


class TrabalhoCreate(TrabalhoBase):
    """Define payload de entrada para criação de trabalho.

    Args:
        None.

    Returns:
        None: Classe de schema para validação de entrada.
    """

    pass


class TrabalhoUpdate(BaseModel):
    """Define payload de entrada para atualização parcial de trabalho.

    Args:
        empregador_id: Identificador UUID opcional do empregador.
        titulo: Título opcional do trabalho.
        descricao: Descrição opcional do trabalho.
        categoria: Categoria opcional do trabalho.
        projeto: Nome opcional do projeto.

    Returns:
        None: Classe de schema para validação de atualização.
    """

    empregador_id: UUID | None = None
    titulo: str | None = Field(default=None, min_length=1)
    descricao: str | None = None
    categoria: str | None = None
    projeto: str | None = None


class TrabalhoRead(TrabalhoBase):
    """Define payload de saída para leitura de trabalho.

    Args:
        id: Identificador UUID do trabalho.
        criado_em: Data e hora de criação do registro.

    Returns:
        None: Classe de schema para serialização de resposta.
    """

    id: UUID
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)
