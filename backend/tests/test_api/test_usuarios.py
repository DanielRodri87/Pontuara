"""Tests for the usuarios API endpoints."""

from unittest.mock import MagicMock
from uuid import uuid4

from fastapi import status
from fastapi.testclient import TestClient

from tests.conftest import SAMPLE_USUARIO


class TestUsuarioEndpoints:
    """Usuario CRUD endpoint tests."""

    def test_create_usuario(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """POST /api/v1/usuarios/ should create and return a usuario."""
        mock_supabase.create_row.return_value = SAMPLE_USUARIO

        payload = {
            "nome": "Maria",
            "sobrenome": "Santos",
            "email": "maria@email.com",
            "tipo_usuario": "funcionario",
        }
        response = client.post("/api/v1/usuarios/", json=payload)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["nome"] == SAMPLE_USUARIO["nome"]
        assert data["email"] == SAMPLE_USUARIO["email"]
        mock_supabase.create_row.assert_called_once()

    def test_list_usuarios(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """GET /api/v1/usuarios/ should return a list of usuarios."""
        mock_supabase.list_rows.return_value = [SAMPLE_USUARIO]

        response = client.get("/api/v1/usuarios/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1

    def test_get_usuario(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """GET /api/v1/usuarios/{id} should return a single usuario."""
        mock_supabase.get_row.return_value = SAMPLE_USUARIO

        usuario_id = uuid4()
        response = client.get(f"/api/v1/usuarios/{usuario_id}")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == SAMPLE_USUARIO["id"]

    def test_update_usuario(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """PUT /api/v1/usuarios/{id} should update and return the usuario."""
        updated = {**SAMPLE_USUARIO, "nome": "Maria Atualizada"}
        mock_supabase.update_row.return_value = updated

        usuario_id = uuid4()
        response = client.put(
            f"/api/v1/usuarios/{usuario_id}",
            json={"nome": "Maria Atualizada"},
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["nome"] == "Maria Atualizada"

    def test_update_usuario_empty_payload(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """PUT /api/v1/usuarios/{id} with empty body should return 400."""
        usuario_id = uuid4()
        response = client.put(
            f"/api/v1/usuarios/{usuario_id}",
            json={},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_delete_usuario(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """DELETE /api/v1/usuarios/{id} should return 204."""
        mock_supabase.delete_row.return_value = None

        usuario_id = uuid4()
        response = client.delete(f"/api/v1/usuarios/{usuario_id}")

        assert response.status_code == status.HTTP_204_NO_CONTENT
