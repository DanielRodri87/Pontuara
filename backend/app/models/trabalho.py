import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Trabalho(Base):
    """Mapeia a tabela `trabalhos` no ORM.

    Args:
        id: Identificador UUID primário.
        empregador_id: Chave estrangeira para `usuarios.id`.
        titulo: Título do trabalho.
        descricao: Descrição opcional do trabalho.
        categoria: Categoria opcional do trabalho.
        projeto: Projeto opcional do trabalho.
        criado_em: Data e hora de criação do registro.

    Returns:
        None: Classe ORM para persistência de trabalhos.
    """

    __tablename__ = "trabalhos"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    empregador_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
    )
    titulo: Mapped[str] = mapped_column(String, nullable=False)
    descricao: Mapped[str | None] = mapped_column(String, nullable=True)
    categoria: Mapped[str | None] = mapped_column(String, nullable=True)
    projeto: Mapped[str | None] = mapped_column(String, nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    empregador = relationship("Usuario", back_populates="trabalhos")
