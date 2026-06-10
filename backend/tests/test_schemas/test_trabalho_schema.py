"""Tests for trabalho Pydantic schemas."""

from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.trabalho import TrabalhoCreate, TrabalhoRead, TrabalhoUpdate


class TestTrabalhoCreate:
    """TrabalhoCreate schema validation tests."""

    def test_valid_minimal(self) -> None:
        """Should accept a valid minimal payload."""
        empregador_id = uuid4()
        data = TrabalhoCreate(
            empregador_id=empregador_id,
            titulo="Desenvolvedor Python",
        )
        assert data.empregador_id == empregador_id
        assert data.titulo == "Desenvolvedor Python"
        assert data.descricao is None

    def test_valid_complete(self) -> None:
        """Should accept a payload with all fields."""
        empregador_id = uuid4()
        projeto_id = uuid4()
        data = TrabalhoCreate(
            empregador_id=empregador_id,
            titulo="Analista de Dados",
            descricao="Vaga para analista",
            categoria="Tecnologia",
            idprojeto=projeto_id,
            duracao="30 days",
        )
        assert data.categoria == "Tecnologia"
        assert data.idprojeto == projeto_id
        assert data.duracao == "30 days"

    def test_invalid_empty_titulo(self) -> None:
        """Should reject empty titulo."""
        with pytest.raises(ValidationError):
            TrabalhoCreate(
                empregador_id=uuid4(),
                titulo="",
            )

    def test_missing_empregador_id(self) -> None:
        """Should reject payload without empregador_id."""
        with pytest.raises(ValidationError):
            TrabalhoCreate(titulo="Vaga")


class TestTrabalhoUpdate:
    """TrabalhoUpdate schema validation tests."""

    def test_empty_update(self) -> None:
        """Should allow an empty update payload."""
        data = TrabalhoUpdate()
        assert data.model_dump(exclude_unset=True) == {}

    def test_partial_update(self) -> None:
        """Should accept partial update."""
        data = TrabalhoUpdate(titulo="Novo Título")
        assert data.titulo == "Novo Título"


class TestTrabalhoRead:
    """TrabalhoRead schema validation tests."""

    def test_valid_read(self) -> None:
        """Should accept a valid read payload with id and criado_em."""
        data = TrabalhoRead(
            id=uuid4(),
            empregador_id=uuid4(),
            titulo="Vaga Backend",
            criado_em="2025-01-01T00:00:00+00:00",
        )
        assert data.id is not None
        assert data.criado_em is not None

    def test_missing_id(self) -> None:
        """Should reject payload without id."""
        with pytest.raises(ValidationError):
            TrabalhoRead(
                empregador_id=uuid4(),
                titulo="Vaga",
                criado_em="2025-01-01T00:00:00+00:00",
            )
