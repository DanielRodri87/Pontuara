"""Tests for the projetos API endpoints."""

from unittest.mock import MagicMock
from uuid import uuid4

from fastapi import status
from fastapi.testclient import TestClient

from tests.conftest import SAMPLE_PROJETO


class TestProjetoEndpoints:
    """Projeto CRUD endpoint tests."""

    def test_create_projeto(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """POST /api/v1/projetos/ should create and return a projeto."""
        mock_supabase.create_row.return_value = SAMPLE_PROJETO

        payload = {
            "titulo": "Novo Projeto",
            "descricao": "Descrição do projeto",
        }
        response = client.post("/api/v1/projetos/", json=payload)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["titulo"] == SAMPLE_PROJETO["titulo"]
        mock_supabase.create_row.assert_called_once()

    def test_list_projetos(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """GET /api/v1/projetos/ should return a list of projetos."""
        mock_supabase.list_rows.return_value = [SAMPLE_PROJETO]

        response = client.get("/api/v1/projetos/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1

    def test_get_projeto(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """GET /api/v1/projetos/{id} should return a single projeto."""
        mock_supabase.get_row.return_value = SAMPLE_PROJETO

        projeto_id = uuid4()
        response = client.get(f"/api/v1/projetos/{projeto_id}")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == SAMPLE_PROJETO["id"]

    def test_update_projeto(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """PUT /api/v1/projetos/{id} should update and return the projeto."""
        updated = {**SAMPLE_PROJETO, "titulo": "Projeto Atualizado"}
        mock_supabase.update_row.return_value = updated

        projeto_id = uuid4()
        response = client.put(
            f"/api/v1/projetos/{projeto_id}",
            json={"titulo": "Projeto Atualizado"},
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["titulo"] == "Projeto Atualizado"

    def test_update_projeto_empty_payload(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """PUT /api/v1/projetos/{id} with empty body should return 400."""
        projeto_id = uuid4()
        response = client.put(
            f"/api/v1/projetos/{projeto_id}",
            json={},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_delete_projeto(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """DELETE /api/v1/projetos/{id} should return 204."""
        mock_supabase.delete_row.return_value = None

        projeto_id = uuid4()
        response = client.delete(f"/api/v1/projetos/{projeto_id}")

        assert response.status_code == status.HTTP_204_NO_CONTENT
