import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Usuario(Base):
    """Map the `usuarios` table in the ORM.

    Args:
        id: Primary UUID identifier.
        nome: User first name.
        sobrenome: User last name.
        email: User unique email.
        telefone: Optional user phone.
        tipo_usuario: User type in the domain.
        criado_em: Record creation timestamp.
        idempresa: Company linked to the user.
        pendente: Whether the user link is pending.

    Returns:
        None: ORM class for user persistence.
    """

    __tablename__ = "usuarios"
    __table_args__ = (
        CheckConstraint(
            "tipo_usuario IN ('funcionario', 'empregador')",
            name="usuarios_tipo_usuario_check",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome: Mapped[str] = mapped_column(String, nullable=False)
    sobrenome: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    telefone: Mapped[str | None] = mapped_column(String, nullable=True)
    tipo_usuario: Mapped[str] = mapped_column(String, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    idempresa: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("empresas.id", ondelete="SET NULL"),
        nullable=True,
    )
    pendente: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")

    empresa = relationship("Empresa", back_populates="usuarios")
    trabalhos = relationship("Trabalho", back_populates="empregador")
