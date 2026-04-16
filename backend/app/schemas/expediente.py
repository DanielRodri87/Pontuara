from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ExpedienteBase(BaseModel):
    """Define campos compartilhados do domínio de expediente.

    Args:
        funcionario_id: Identificador UUID do funcionário.
        data_hora_inicio: Data e hora de início do expediente.
        data_hora_fim: Data e hora de fim do expediente, quando existir.

    Returns:
        None: Classe de schema para validação e serialização.
    """

    funcionario_id: UUID
    data_hora_inicio: datetime
    data_hora_fim: datetime | None = None


class ExpedienteCreate(ExpedienteBase):
    """Define payload de entrada para criação de expediente.

    Args:
        None.

    Returns:
        None: Classe de schema para validação de entrada.
    """

    pass


class ExpedienteUpdate(BaseModel):
    """Define payload de entrada para atualização parcial de expediente.

    Args:
        funcionario_id: Identificador UUID opcional do funcionário.
        data_hora_inicio: Data e hora opcional de início do expediente.
        data_hora_fim: Data e hora opcional de fim do expediente.

    Returns:
        None: Classe de schema para validação de atualização.
    """

    funcionario_id: UUID | None = None
    data_hora_inicio: datetime | None = None
    data_hora_fim: datetime | None = None


class ExpedienteRead(ExpedienteBase):
    """Define payload de saída para leitura de expediente.

    Args:
        id: Identificador UUID do expediente.

    Returns:
        None: Classe de schema para serialização de resposta.
    """

    id: UUID

    model_config = ConfigDict(from_attributes=True)
