"""Tests for usuario Pydantic schemas."""

from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.usuario import (
    TipoUsuario,
    UsuarioCreate,
    UsuarioRead,
    UsuarioUpdate,
)


class TestUsuarioCreate:
    """UsuarioCreate schema validation tests."""

    def test_valid_minimal(self) -> None:
        """Should accept valid minimal payload."""
        data = UsuarioCreate(
            nome="Maria",
            sobrenome="Santos",
            email="maria@email.com",
            tipo_usuario="funcionario",
        )
        assert data.nome == "Maria"
        assert data.tipo_usuario == "funcionario"
        assert data.pendente is False

    def test_valid_complete(self) -> None:
        """Should accept payload with all optional fields."""
        empresa_id = uuid4()
        data = UsuarioCreate(
            nome="Carlos",
            sobrenome="Oliveira",
            email="carlos@email.com",
            telefone="11987654321",
            tipo_usuario="empregador",
            idempresa=empresa_id,
            pendente=True,
        )
        assert data.telefone == "11987654321"
        assert data.idempresa == empresa_id
        assert data.pendente is True

    def test_invalid_empty_name(self) -> None:
        """Should reject empty nome."""
        with pytest.raises(ValidationError):
            UsuarioCreate(
                nome="",
                sobrenome="Silva",
                email="test@email.com",
                tipo_usuario="funcionario",
            )

    def test_invalid_email(self) -> None:
        """Should reject malformed email."""
        with pytest.raises(ValidationError):
            UsuarioCreate(
                nome="João",
                sobrenome="Silva",
                email="not-an-email",
                tipo_usuario="funcionario",
            )

    @pytest.mark.parametrize(
        "invalid_type", ["admin", "gerente", "", 123],
    )
    def test_invalid_tipo_usuario(self, invalid_type: object) -> None:
        """Should reject invalid tipo_usuario values."""
        with pytest.raises(ValidationError):
            UsuarioCreate(
                nome="Ana",
                sobrenome="Costa",
                email="ana@email.com",
                tipo_usuario=invalid_type,  # type: ignore[arg-type]
            )

    def test_valid_tipo_usuario_funcionario(self) -> None:
        """Should accept 'funcionario' as tipo_usuario."""
        data = UsuarioCreate(
            nome="Pedro",
            sobrenome="Lima",
            email="pedro@email.com",
            tipo_usuario="funcionario",
        )
        assert data.tipo_usuario == "funcionario"

    def test_valid_tipo_usuario_empregador(self) -> None:
        """Should accept 'empregador' as tipo_usuario."""
        data = UsuarioCreate(
            nome="Sofia",
            sobrenome="Rocha",
            email="sofia@email.com",
            tipo_usuario="empregador",
        )
        assert data.tipo_usuario == "empregador"


class TestUsuarioUpdate:
    """UsuarioUpdate schema validation tests."""

    def test_empty_update(self) -> None:
        """Should allow an empty update payload."""
        data = UsuarioUpdate()
        assert data.model_dump(exclude_unset=True) == {}

    def test_partial_update(self) -> None:
        """Should accept partial fields."""
        data = UsuarioUpdate(nome="NovoNome")
        assert data.nome == "NovoNome"
        assert data.sobrenome is None

    def test_invalid_email_in_update(self) -> None:
        """Should reject malformed email in update."""
        with pytest.raises(ValidationError):
            UsuarioUpdate(email="bad-email")


class TestUsuarioRead:
    """UsuarioRead schema validation tests."""

    def test_valid_read(self) -> None:
        """Should accept a valid user read payload."""
        data = UsuarioRead(
            id=uuid4(),
            nome="João",
            sobrenome="Silva",
            email="joao@email.com",
            tipo_usuario="funcionario",
            criado_em="2025-01-01T00:00:00+00:00",
        )
        assert data.id is not None
        assert data.criado_em is not None

    def test_missing_id(self) -> None:
        """Should reject payload without id."""
        with pytest.raises(ValidationError):
            UsuarioRead(
                nome="João",
                sobrenome="Silva",
                email="joao@email.com",
                tipo_usuario="funcionario",
                criado_em="2025-01-01T00:00:00+00:00",
            )
