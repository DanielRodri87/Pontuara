import uuid
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Projeto(Base):
    """Map the `projetos` table in the ORM."""

    __tablename__ = "projetos"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    titulo: Mapped[str] = mapped_column(String, nullable=False)
    descricao: Mapped[str | None] = mapped_column(String, nullable=True)
    badgets: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    idempresa: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("empresas.id", ondelete="SET NULL"),
        nullable=True,
    )

    empresa = relationship("Empresa", back_populates="projetos")
    trabalhos = relationship("Trabalho", back_populates="projeto")
