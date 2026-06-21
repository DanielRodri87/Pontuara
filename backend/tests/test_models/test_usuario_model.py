"""Tests for the Usuario SQLAlchemy model."""

import uuid

import pytest
from sqlalchemy import CheckConstraint, Column
from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy import Column

from app.models.usuario import Usuario


class TestUsuarioModel:
    """Usuario model definition tests."""

    def test_tablename(self) -> None:
        """Should use the correct table name."""
        assert Usuario.__tablename__ == "usuarios"

    def test_primary_key_type(self) -> None:
        """Should have UUID primary key."""
        id_column: Column = Usuario.__table__.c["id"]
        assert isinstance(id_column.type, UUID)

    def test_primary_key_has_default_generator(self) -> None:
        """Should have a UUID default generator on the column."""
        id_column: Column = Usuario.__table__.c["id"]
        assert id_column.default is not None
        assert callable(id_column.default.arg)

    def test_required_fields(self) -> None:
        """Should require nome, sobrenome, email, and tipo_usuario."""
        user = Usuario(
            id=uuid.uuid4(),
            nome="João",
            sobrenome="Silva",
            email="joao@email.com",
            tipo_usuario="funcionario",
        )
        assert user.nome == "João"
        assert user.sobrenome == "Silva"
        assert user.email == "joao@email.com"
        assert user.tipo_usuario == "funcionario"

    def test_optional_fields_default_to_none(self) -> None:
        """Should default optional fields to None."""
        user = Usuario(
            id=uuid.uuid4(),
            nome="João",
            sobrenome="Silva",
            email="joao@email.com",
            tipo_usuario="funcionario",
        )
        assert user.telefone is None
        assert user.idempresa is None

    def test_pendente_column_default(self) -> None:
        """Should check that pendente column has a server default of false."""
        pendente_column: Column = Usuario.__table__.c["pendente"]
        assert pendente_column.server_default is not None
        # The column is nullable=False and has server_default="false"
        assert pendente_column.nullable is False

    def test_unique_email_constraint(self) -> None:
        """Should have unique constraint on email column."""
        email_column: Column = Usuario.__table__.c["email"]
        assert email_column.unique is True

    def test_check_constraint_exists(self) -> None:
        """Should enforce tipo_usuario check constraint."""
        constraints = Usuario.__table_args__
        check_constraints = [c for c in constraints if isinstance(c, CheckConstraint)]
        assert len(check_constraints) > 0
        constraint_names = [c.name for c in check_constraints]
        assert "usuarios_tipo_usuario_check" in constraint_names

    def test_relationships_defined(self) -> None:
        """Should have empresa and trabalhos relationships."""
        assert hasattr(Usuario, "empresa")
        assert hasattr(Usuario, "trabalhos")
