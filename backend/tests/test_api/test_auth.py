"""Tests for the auth API endpoints."""

from unittest.mock import MagicMock
from uuid import uuid4

from fastapi import HTTPException, status
from fastapi.testclient import TestClient

from tests.conftest import SAMPLE_USUARIO


class TestAuthEndpoints:
    """Auth endpoint tests."""

    def test_login_success(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """POST /api/v1/auth/login should return session data on success."""
        mock_supabase.login_user.return_value = {
            "access_token": "fake-token",
            "token_type": "bearer",
        }

        response = client.post(
            "/api/v1/auth/login",
            json={"email": "user@email.com", "password": "Senha@123"},
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["access_token"] == "fake-token"
        mock_supabase.login_user.assert_called_once_with(
            "user@email.com", "Senha@123"
        )

    def test_login_invalid_credentials(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """POST /api/v1/auth/login should return 401 on invalid credentials."""
        mock_supabase.login_user.side_effect = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou palavra-passe incorretos.",
        )

        response = client.post(
            "/api/v1/auth/login",
            json={"email": "wrong@email.com", "password": "WrongPass@1"},
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_signup_success(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """POST /api/v1/auth/signup should create user and return user data."""
        user_id = str(uuid4())
        SAMPLE_USUARIO["id"] = user_id
        mock_supabase.get_user_by_email.return_value = None
        mock_supabase.signup_user.return_value = {"user": {"id": user_id}}
        mock_supabase.create_row.return_value = SAMPLE_USUARIO

        response = client.post(
            "/api/v1/auth/signup",
            json={
                "nome": "João",
                "sobrenome": "Silva",
                "email": "joao@email.com",
                "password": "SenhaForte@123",
                "tipo_usuario": "funcionario",
            },
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == SAMPLE_USUARIO["email"]
        mock_supabase.signup_user.assert_called_once()
        mock_supabase.create_row.assert_called_once()

    def test_signup_duplicate_email(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """POST /api/v1/auth/signup with existing email should return 409."""
        mock_supabase.get_user_by_email.return_value = SAMPLE_USUARIO

        response = client.post(
            "/api/v1/auth/signup",
            json={
                "nome": "João",
                "sobrenome": "Silva",
                "email": "joao@email.com",
                "password": "SenhaForte@123",
                "tipo_usuario": "funcionario",
            },
        )

        assert response.status_code == status.HTTP_409_CONFLICT

    def test_signup_invalid_password(self, client: TestClient) -> None:
        """POST /api/v1/auth/signup with weak password should return 422."""
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "nome": "João",
                "sobrenome": "Silva",
                "email": "joao@email.com",
                "password": "123",
                "tipo_usuario": "funcionario",
            },
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_signup_invalid_tipo_usuario(self, client: TestClient) -> None:
        """POST /api/v1/auth/signup with invalid tipo_usuario should return 422."""
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "nome": "João",
                "sobrenome": "Silva",
                "email": "joao@email.com",
                "password": "SenhaForte@123",
                "tipo_usuario": "admin",
            },
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_forgot_password(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """POST /api/v1/auth/forgot-password should trigger recovery."""
        mock_supabase.recover_password.return_value = {"message": "Recovery email sent"}

        response = client.post(
            "/api/v1/auth/forgot-password",
            json={"email": "user@email.com"},
        )

        assert response.status_code == status.HTTP_200_OK

    def test_reset_password_invalid_token(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """POST /api/v1/auth/reset-password with invalid token should return 401."""
        mock_supabase.verify_otp.side_effect = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Código inválido ou expirado.",
        )

        response = client.post(
            "/api/v1/auth/reset-password",
            json={"token": "bad-token", "new_password": "NovaSenha@123"},
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_reset_password_no_access_token(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """POST /api/v1/auth/reset-password without access_token should return 401."""
        mock_supabase.verify_otp.return_value = {}  # no access_token in response

        response = client.post(
            "/api/v1/auth/reset-password",
            json={"token": "valid-token", "new_password": "NovaSenha@123"},
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Não foi possível validar" in response.json()["detail"]

    def test_signup_generic_exception(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """POST /api/v1/auth/signup should return 500 on unexpected error."""
        user_id = str(uuid4())
        mock_supabase.get_user_by_email.return_value = None
        mock_supabase.signup_user.return_value = {"user": {"id": user_id}}
        mock_supabase.create_row.side_effect = RuntimeError("Erro inesperado")

        response = client.post(
            "/api/v1/auth/signup",
            json={
                "nome": "João",
                "sobrenome": "Silva",
                "email": "joao@email.com",
                "password": "SenhaForte@123",
                "tipo_usuario": "funcionario",
            },
        )

        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "Erro ao criar usuário" in response.json()["detail"]

    def test_reset_password_success(self, client: TestClient, mock_supabase: MagicMock) -> None:
        """POST /api/v1/auth/reset-password should succeed when valid."""
        mock_supabase.verify_otp.return_value = {"access_token": "valid-token"}
        mock_supabase.update_user_password.return_value = {
            "id": str(uuid4()),
            "email": "user@email.com",
        }

        response = client.post(
            "/api/v1/auth/reset-password",
            json={"token": "valid-token", "new_password": "NovaSenha@123"},
        )

        assert response.status_code == status.HTTP_200_OK
        mock_supabase.update_user_password.assert_called_once_with(
            "valid-token", "NovaSenha@123"
        )
