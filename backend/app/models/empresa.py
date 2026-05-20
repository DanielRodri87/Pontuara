import uuid

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Empresa(Base):
    """Mapeia a tabela `empresas` no ORM."""

    __tablename__ = "empresas"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome: Mapped[str] = mapped_column(String, nullable=False)
    codigoempresa: Mapped[str] = mapped_column(String, unique=True, nullable=False)

    usuarios = relationship("Usuario", back_populates="empresa")
    projetos = relationship("Projeto", back_populates="empresa")
