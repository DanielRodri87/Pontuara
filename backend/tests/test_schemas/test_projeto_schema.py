"""Tests for projeto Pydantic schemas."""

from decimal import Decimal
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.projeto import ProjetoCreate, ProjetoRead, ProjetoUpdate


class TestProjetoCreate:
    """ProjetoCreate schema validation tests."""

    def test_valid_minimal(self) -> None:
        """Should accept a valid minimal payload."""
        data = ProjetoCreate(titulo="Projeto X")
        assert data.titulo == "Projeto X"
        assert data.descricao is None
        assert data.badgets is None

    def test_valid_complete(self) -> None:
        """Should accept a payload with all fields."""
        empresa_id = uuid4()
        data = ProjetoCreate(
            titulo="Projeto Y",
            descricao="Descrição detalhada",
            badgets=Decimal("250.50"),
            idempresa=empresa_id,
        )
        assert data.badgets == Decimal("250.50")
        assert data.idempresa == empresa_id

    def test_invalid_empty_titulo(self) -> None:
        """Should reject empty titulo."""
        with pytest.raises(ValidationError):
            ProjetoCreate(titulo="")


class TestProjetoUpdate:
    """ProjetoUpdate schema validation tests."""

    def test_empty_update(self) -> None:
        """Should allow an empty update payload."""
        data = ProjetoUpdate()
        assert data.model_dump(exclude_unset=True) == {}


class TestProjetoRead:
    """ProjetoRead schema validation tests."""

    def test_valid_read(self) -> None:
        """Should accept a valid read payload with id."""
        data = ProjetoRead(
            id=uuid4(),
            titulo="Projeto Alpha",
        )
        assert data.id is not None

    def test_missing_id(self) -> None:
        """Should reject payload without id."""
        with pytest.raises(ValidationError):
            ProjetoRead(titulo="Projeto Alpha")
