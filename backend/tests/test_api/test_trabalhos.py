"""Tests for the trabalhos API endpoints."""

from unittest.mock import MagicMock
from uuid import uuid4

from fastapi import status
from fastapi.testclient import TestClient

from tests.conftest import SAMPLE_TRABALHO


class TestTrabalhoEndpoints:
    """Trabalho CRUD endpoint tests."""

    def test_create_trabalho(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """POST /api/v1/trabalhos/ should create and return a trabalho."""
        mock_supabase.create_row.return_value = SAMPLE_TRABALHO

        payload = {
            "empregador_id": str(uuid4()),
            "titulo": "Nova Vaga",
            "descricao": "Descrição da vaga",
        }
        response = client.post("/api/v1/trabalhos/", json=payload)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["titulo"] == SAMPLE_TRABALHO["titulo"]
        mock_supabase.create_row.assert_called_once()

    def test_list_trabalhos(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """GET /api/v1/trabalhos/ should return a list of trabalhos."""
        mock_supabase.list_rows.return_value = [SAMPLE_TRABALHO]

        response = client.get("/api/v1/trabalhos/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1

    def test_get_trabalho(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """GET /api/v1/trabalhos/{id} should return a single trabalho."""
        mock_supabase.get_row.return_value = SAMPLE_TRABALHO

        trabalho_id = uuid4()
        response = client.get(f"/api/v1/trabalhos/{trabalho_id}")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == SAMPLE_TRABALHO["id"]

    def test_update_trabalho(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """PUT /api/v1/trabalhos/{id} should update and return the trabalho."""
        updated = {**SAMPLE_TRABALHO, "titulo": "Vaga Atualizada"}
        mock_supabase.update_row.return_value = updated

        trabalho_id = uuid4()
        response = client.put(
            f"/api/v1/trabalhos/{trabalho_id}",
            json={"titulo": "Vaga Atualizada"},
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["titulo"] == "Vaga Atualizada"

    def test_update_trabalho_empty_payload(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """PUT /api/v1/trabalhos/{id} with empty body should return 400."""
        trabalho_id = uuid4()
        response = client.put(
            f"/api/v1/trabalhos/{trabalho_id}",
            json={},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_delete_trabalho(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """DELETE /api/v1/trabalhos/{id} should return 204."""
        mock_supabase.delete_row.return_value = None

        trabalho_id = uuid4()
        response = client.delete(f"/api/v1/trabalhos/{trabalho_id}")

        assert response.status_code == status.HTTP_204_NO_CONTENT
