"""Shared fixtures for all backend tests."""

from __future__ import annotations

from __future__ import annotations

from collections.abc import Generator
from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.main import app


# ---------------------------------------------------------------------------
# Endpoint modules that import supabase_service
# ---------------------------------------------------------------------------

_PATCH_PATHS = [
    "app.api.v1.endpoints.empresas.supabase_service",
    "app.api.v1.endpoints.projetos.supabase_service",
    "app.api.v1.endpoints.usuarios.supabase_service",
    "app.api.v1.endpoints.trabalhos.supabase_service",
    "app.api.v1.endpoints.auth.supabase_service",
]

# ---------------------------------------------------------------------------
# Sample data used across tests
# ---------------------------------------------------------------------------

SAMPLE_EMPRESA = {
    "id": str(uuid4()),
    "nome": "Empresa Teste Ltda",
    "codigoempresa": "EMP001",
}

SAMPLE_PROJETO = {
    "id": str(uuid4()),
    "titulo": "Projeto Alpha",
    "descricao": "Descrição do projeto",
    "badgets": "150.00",
    "idempresa": str(uuid4()),
}

SAMPLE_USUARIO = {
    "id": str(uuid4()),
    "nome": "João",
    "sobrenome": "Silva",
    "email": "joao@email.com",
    "telefone": None,
    "tipo_usuario": "funcionario",
    "idempresa": None,
    "pendente": False,
    "criado_em": "2025-01-01T00:00:00+00:00",
}

SAMPLE_TRABALHO = {
    "id": str(uuid4()),
    "empregador_id": str(uuid4()),
    "titulo": "Desenvolvedor Backend",
    "descricao": "Vaga para dev backend",
    "categoria": "Tecnologia",
    "idprojeto": None,
    "criado_em": "2025-01-01T00:00:00+00:00",
    "duracao": None,
}


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """Provide a FastAPI TestClient instance."""
    with TestClient(app) as c:
        yield c


@pytest.fixture
def mock_supabase() -> MagicMock:
    """Mock `supabase_service` in every endpoint module that imports it."""
    mock = MagicMock()
    patchers = [patch(path, mock) for path in _PATCH_PATHS]
    for p in patchers:
        p.start()
    yield mock
    for p in patchers:
        p.stop()
