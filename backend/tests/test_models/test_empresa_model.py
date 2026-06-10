"""Tests for the Empresa SQLAlchemy model."""

import uuid

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import UUID

from app.models.empresa import Empresa


class TestEmpresaModel:
    """Empresa model definition tests."""

    def test_tablename(self) -> None:
        """Should use the correct table name."""
        assert Empresa.__tablename__ == "empresas"

    def test_primary_key_type(self) -> None:
        """Should have UUID primary key."""
        id_column: Column = Empresa.__table__.c["id"]
        assert isinstance(id_column.type, UUID)

    def test_required_fields(self) -> None:
        """Should require nome and codigoempresa."""
        empresa = Empresa(id=uuid.uuid4(), nome="Teste Ltda", codigoempresa="TST001")
        assert empresa.nome == "Teste Ltda"
        assert empresa.codigoempresa == "TST001"

    def test_primary_key_has_default_generator(self) -> None:
        """Should have a UUID default generator on the column."""
        id_column: Column = Empresa.__table__.c["id"]
        assert id_column.default is not None
        assert callable(id_column.default.arg)

    def test_unique_codigoempresa(self) -> None:
        """Should have unique constraint on codigoempresa."""
        codigo_column: Column = Empresa.__table__.c["codigoempresa"]
        assert codigo_column.unique is True

    def test_relationships_defined(self) -> None:
        """Should have usuarios and projetos relationships."""
        assert hasattr(Empresa, "usuarios")
        assert hasattr(Empresa, "projetos")
