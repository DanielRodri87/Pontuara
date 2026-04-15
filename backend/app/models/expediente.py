import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Expediente(Base):
    """Mapeia a tabela `expedientes` no ORM.

    Args:
        id: Identificador UUID primário.
        funcionario_id: Chave estrangeira para `usuarios.id`.
        data_hora_inicio: Data e hora de início do expediente.
        data_hora_fim: Data e hora de fim, quando disponível.

    Returns:
        None: Classe ORM para persistência de expedientes.
    """

    __tablename__ = "expedientes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    funcionario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
    )
    data_hora_inicio: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    data_hora_fim: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    funcionario = relationship("Usuario", back_populates="expedientes")
