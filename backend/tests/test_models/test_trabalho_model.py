"""Tests for the Trabalho SQLAlchemy model."""

import uuid

from datetime import timedelta
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import UUID

from app.models.trabalho import Trabalho


class TestTrabalhoModel:
    """Trabalho model definition tests."""

    def test_tablename(self) -> None:
        """Should use the correct table name."""
        assert Trabalho.__tablename__ == "trabalhos"

    def test_primary_key_type(self) -> None:
        """Should have UUID primary key."""
        id_column: Column = Trabalho.__table__.c["id"]
        assert isinstance(id_column.type, UUID)

    def test_required_fields(self) -> None:
        """Should require empregador_id and titulo."""
        trabalho = Trabalho(id=uuid.uuid4(), empregador_id=uuid.uuid4(), titulo="Vaga Teste")
        assert trabalho.titulo == "Vaga Teste"

    def test_primary_key_has_default_generator(self) -> None:
        """Should have a UUID default generator on the column."""
        id_column: Column = Trabalho.__table__.c["id"]
        assert id_column.default is not None
        assert callable(id_column.default.arg)

    def test_optional_fields_default_to_none(self) -> None:
        """Should default descricao, categoria, idprojeto, duracao to None."""
        trabalho = Trabalho(id=uuid.uuid4(), empregador_id=uuid.uuid4(), titulo="Vaga")
        assert trabalho.descricao is None
        assert trabalho.categoria is None
        assert trabalho.idprojeto is None
        assert trabalho.duracao is None

    def test_duracao_interval(self) -> None:
        """Should accept timedelta for duracao."""
        trabalho = Trabalho(
            id=uuid.uuid4(),
            empregador_id=uuid.uuid4(),
            titulo="Vaga Intervalo",
            duracao=timedelta(days=30),
        )
        assert trabalho.duracao == timedelta(days=30)

    def test_relationships_defined(self) -> None:
        """Should have empregador and projeto relationships."""
        assert hasattr(Trabalho, "empregador")
        assert hasattr(Trabalho, "projeto")
