import uuid
from datetime import datetime, timedelta

from sqlalchemy import DateTime, ForeignKey, Interval, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Trabalho(Base):
    """Map the `trabalhos` table in the ORM.

    Args:
        id: Primary UUID identifier.
        empregador_id: Foreign key to `usuarios.id`.
        titulo: Job title.
        descricao: Optional job description.
        categoria: Optional job category.
        idprojeto: Optional project for the job.
        criado_em: Record creation timestamp.
        duracao: Optional job duration.

    Returns:
        None: ORM class for job persistence.
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
    idprojeto: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projetos.id", ondelete="SET NULL"),
        nullable=True,
    )
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    duracao: Mapped[timedelta | None] = mapped_column(Interval, nullable=True)

    empregador = relationship("Usuario", back_populates="trabalhos")
    projeto = relationship("Projeto", back_populates="trabalhos")
