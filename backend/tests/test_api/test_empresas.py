"""Tests for the empresas API endpoints."""

from unittest.mock import MagicMock
from uuid import uuid4

from fastapi import status
from fastapi.testclient import TestClient

from tests.conftest import SAMPLE_EMPRESA


class TestEmpresaEndpoints:
    """Empresa CRUD endpoint tests."""

    def test_create_empresa(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """POST /api/v1/empresas/ should create and return a empresa."""
        mock_supabase.create_row.return_value = SAMPLE_EMPRESA

        payload = {"nome": "Nova Empresa", "codigoempresa": "NOVO001"}
        response = client.post("/api/v1/empresas/", json=payload)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["nome"] == SAMPLE_EMPRESA["nome"]
        assert data["codigoempresa"] == SAMPLE_EMPRESA["codigoempresa"]
        mock_supabase.create_row.assert_called_once()

    def test_list_empresas(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """GET /api/v1/empresas/ should return a list of empresas."""
        mock_supabase.list_rows.return_value = [SAMPLE_EMPRESA]

        response = client.get("/api/v1/empresas/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1

    def test_get_empresa(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """GET /api/v1/empresas/{id} should return a single empresa."""
        mock_supabase.get_row.return_value = SAMPLE_EMPRESA

        empresa_id = uuid4()
        response = client.get(f"/api/v1/empresas/{empresa_id}")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == SAMPLE_EMPRESA["id"]

    def test_get_empresa_not_found(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """GET /api/v1/empresas/{id} should propagate HTTPException 404."""
        from fastapi import HTTPException
        mock_supabase.get_row.side_effect = HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Registro não encontrado"
        )

        empresa_id = uuid4()
        response = client.get(f"/api/v1/empresas/{empresa_id}")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_empresa(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """PUT /api/v1/empresas/{id} should update and return the empresa."""
        updated = {**SAMPLE_EMPRESA, "nome": "Empresa Atualizada"}
        mock_supabase.update_row.return_value = updated

        empresa_id = uuid4()
        response = client.put(
            f"/api/v1/empresas/{empresa_id}",
            json={"nome": "Empresa Atualizada"},
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["nome"] == "Empresa Atualizada"

    def test_update_empresa_empty_payload(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """PUT /api/v1/empresas/{id} with empty body should return 400."""
        empresa_id = uuid4()
        response = client.put(
            f"/api/v1/empresas/{empresa_id}",
            json={},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_delete_empresa(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """DELETE /api/v1/empresas/{id} should return 204."""
        mock_supabase.delete_row.return_value = None

        empresa_id = uuid4()
        response = client.delete(f"/api/v1/empresas/{empresa_id}")

        assert response.status_code == status.HTTP_204_NO_CONTENT
