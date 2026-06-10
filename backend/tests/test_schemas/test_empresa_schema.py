"""Tests for empresa Pydantic schemas."""

from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.empresa import EmpresaCreate, EmpresaRead, EmpresaUpdate


class TestEmpresaCreate:
    """EmpresaCreate schema validation tests."""

    def test_valid(self) -> None:
        """Should accept a valid payload."""
        data = EmpresaCreate(nome="Tech Solutions", codigoempresa="TECH001")
        assert data.nome == "Tech Solutions"
        assert data.codigoempresa == "TECH001"

    def test_invalid_empty_nome(self) -> None:
        """Should reject empty nome."""
        with pytest.raises(ValidationError):
            EmpresaCreate(nome="", codigoempresa="CODE01")

    def test_invalid_empty_codigo(self) -> None:
        """Should reject empty codigoempresa."""
        with pytest.raises(ValidationError):
            EmpresaCreate(nome="Minha Empresa", codigoempresa="")


class TestEmpresaUpdate:
    """EmpresaUpdate schema validation tests."""

    def test_empty_update(self) -> None:
        """Should allow an empty update payload."""
        data = EmpresaUpdate()
        assert data.model_dump(exclude_unset=True) == {}


class TestEmpresaRead:
    """EmpresaRead schema validation tests."""

    def test_valid_read(self) -> None:
        """Should accept a valid read payload with id."""
        data = EmpresaRead(
            id=uuid4(),
            nome="Tech Solutions",
            codigoempresa="TECH001",
        )
        assert data.id is not None

    def test_missing_id(self) -> None:
        """Should reject payload without id."""
        with pytest.raises(ValidationError):
            EmpresaRead(nome="Tech Solutions", codigoempresa="TECH001")
