"""Tests for the Projeto SQLAlchemy model."""

import uuid

from decimal import Decimal
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import UUID

from app.models.projeto import Projeto


class TestProjetoModel:
    """Projeto model definition tests."""

    def test_tablename(self) -> None:
        """Should use the correct table name."""
        assert Projeto.__tablename__ == "projetos"

    def test_primary_key_type(self) -> None:
        """Should have UUID primary key."""
        id_column: Column = Projeto.__table__.c["id"]
        assert isinstance(id_column.type, UUID)

    def test_required_fields(self) -> None:
        """Should require titulo."""
        projeto = Projeto(id=uuid.uuid4(), titulo="Projeto Teste")
        assert projeto.titulo == "Projeto Teste"

    def test_optional_fields_default_to_none(self) -> None:
        """Should default descricao, badgets, idempresa to None."""
        projeto = Projeto(id=uuid.uuid4(), titulo="Projeto Teste")
        assert projeto.descricao is None
        assert projeto.badgets is None
        assert projeto.idempresa is None

    def test_primary_key_has_default_generator(self) -> None:
        """Should have a UUID default generator on the column."""
        id_column: Column = Projeto.__table__.c["id"]
        assert id_column.default is not None
        assert callable(id_column.default.arg)

    def test_decimal_precision(self) -> None:
        """Should accept Decimal for badgets."""
        projeto = Projeto(id=uuid.uuid4(), titulo="Projeto Decimal", badgets=Decimal("150.75"))
        assert projeto.badgets == Decimal("150.75")

    def test_relationships_defined(self) -> None:
        """Should have empresa and trabalhos relationships."""
        assert hasattr(Projeto, "empresa")
        assert hasattr(Projeto, "trabalhos")
