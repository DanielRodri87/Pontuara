import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Usuario(Base):
    """Mapeia a tabela `usuarios` no ORM.

    Args:
        id: Identificador UUID primário.
        nome: Nome do usuário.
        sobrenome: Sobrenome do usuário.
        email: E-mail único do usuário.
        senha: Senha armazenada no registro.
        telefone: Telefone opcional do usuário.
        tipo_usuario: Tipo do usuário no domínio.
        criado_em: Data e hora de criação do registro.

    Returns:
        None: Classe ORM para persistência de usuários.
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
    senha: Mapped[str] = mapped_column(String, nullable=False)
    telefone: Mapped[str | None] = mapped_column(String, nullable=True)
    tipo_usuario: Mapped[str] = mapped_column(String, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    expedientes = relationship("Expediente", back_populates="funcionario")
    trabalhos = relationship("Trabalho", back_populates="empregador")
