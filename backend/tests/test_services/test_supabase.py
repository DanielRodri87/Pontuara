"""Tests for the SupabaseService class."""

from unittest.mock import patch
from uuid import uuid4

import httpx
import pytest
from fastapi import HTTPException

from app.services.supabase import SupabaseService


@pytest.fixture
def service() -> SupabaseService:
    """Provide a clean SupabaseService instance."""
    return SupabaseService()


@pytest.fixture
def ensure_configured() -> None:
    """Ensure Supabase settings are present for the test.

    Note: supabase_rest_url is a @property derived from supabase_url,
    so we patch supabase_url directly.
    """
    with (
        patch("app.services.supabase.settings.supabase_url", "https://test.supabase.co"),
        patch("app.services.supabase.settings.supabase_key", "test-key"),
        patch("app.services.supabase.settings.supabase_schema", "public"),
        patch("app.services.supabase.settings.supabase_timeout", 15.0),
    ):
        yield


class TestSupabaseService:
    """SupabaseService unit tests."""

    def test_ensure_configured_raises_when_missing(self, service: SupabaseService) -> None:
        """Should raise 503 when Supabase is not configured.

        The _ensure_configured method reads supabase_rest_url (a @property)
        which returns None when supabase_url is None.
        """
        with (
            patch("app.services.supabase.settings.supabase_url", None),
            patch("app.services.supabase.settings.supabase_key", None),
        ):
            with pytest.raises(HTTPException) as exc:
                service._ensure_configured()
            assert exc.value.status_code == 503

    def test_ensure_configured_returns_url_and_key(self, service: SupabaseService) -> None:
        """Should return URL and key when configured."""
        with (
            patch("app.services.supabase.settings.supabase_url", "https://test.supabase.co"),
            patch("app.services.supabase.settings.supabase_key", "test-key"),
        ):
            url, key = service._ensure_configured()
            assert url == "https://test.supabase.co/rest/v1"
            assert key == "test-key"

    def test_list_rows_success(self, service: SupabaseService, ensure_configured: None) -> None:
        """list_rows should return a list of rows."""
        mock_response = [{"id": str(uuid4()), "nome": "Test"}]

        with patch("app.services.supabase._client.request") as mock_request:
            mock_request.return_value.status_code = 200
            mock_request.return_value.json.return_value = mock_response

            result = service.list_rows("empresas")

            assert result == mock_response
            mock_request.assert_called_once()

    def test_list_rows_error(self, service: SupabaseService, ensure_configured: None) -> None:
        """list_rows should raise HTTPException on error."""
        with patch("app.services.supabase._client.request") as mock_request:
            mock_request.return_value.status_code = 500
            mock_request.return_value.json.return_value = {}

            with pytest.raises(HTTPException) as exc:
                service.list_rows("empresas")

            assert exc.value.status_code == 500

    def test_get_row_success(self, service: SupabaseService, ensure_configured: None) -> None:
        """get_row should return a single row."""
        item_id = uuid4()
        mock_row = {"id": str(item_id), "nome": "Test"}

        with patch("app.services.supabase._client.request") as mock_request:
            mock_request.return_value.status_code = 200
            mock_request.return_value.json.return_value = mock_row

            result = service.get_row("empresas", item_id)

            assert result == mock_row

    def test_get_row_not_found(self, service: SupabaseService, ensure_configured: None) -> None:
        """get_row should raise 404 when row is not found."""
        with patch("app.services.supabase._client.request") as mock_request:
            mock_request.return_value.status_code = 404
            mock_request.return_value.json.return_value = {}

            with pytest.raises(HTTPException) as exc:
                service.get_row("empresas", uuid4())
            assert exc.value.status_code == 404

    def test_get_user_by_email_found(self, service: SupabaseService, ensure_configured: None) -> None:
        """get_user_by_email should return user when found."""
        user = {"id": str(uuid4()), "email": "test@email.com"}

        with patch("app.services.supabase._client.request") as mock_request:
            mock_request.return_value.status_code = 200
            mock_request.return_value.json.return_value = [user]

            result = service.get_user_by_email("usuarios", "test@email.com")
            assert result == user

    def test_get_user_by_email_not_found(self, service: SupabaseService, ensure_configured: None) -> None:
        """get_user_by_email should return None when not found."""
        with patch("app.services.supabase._client.request") as mock_request:
            mock_request.return_value.status_code = 200
            mock_request.return_value.json.return_value = []

            result = service.get_user_by_email("usuarios", "notfound@email.com")
            assert result is None

    def test_create_row_success(self, service: SupabaseService, ensure_configured: None) -> None:
        """create_row should return the created row."""
        created = {"id": str(uuid4()), "nome": "Novo"}

        with patch("app.services.supabase._client.request") as mock_request:
            mock_request.return_value.status_code = 201
            mock_request.return_value.json.return_value = [created]

            result = service.create_row("empresas", {"nome": "Novo"})

            assert result == created

    def test_update_row_success(self, service: SupabaseService, ensure_configured: None) -> None:
        """update_row should return the updated row."""
        item_id = uuid4()
        updated = {"id": str(item_id), "nome": "Atualizado"}

        with patch("app.services.supabase._client.request") as mock_request:
            mock_request.return_value.status_code = 200
            mock_request.return_value.json.return_value = [updated]

            result = service.update_row("empresas", item_id, {"nome": "Atualizado"})

            assert result == updated

    def test_update_row_not_found(self, service: SupabaseService, ensure_configured: None) -> None:
        """update_row should raise 404 when row is not found."""
        with patch("app.services.supabase._client.request") as mock_request:
            mock_request.return_value.status_code = 200
            mock_request.return_value.json.return_value = []

            with pytest.raises(HTTPException) as exc:
                service.update_row("empresas", uuid4(), {"nome": "X"})
            assert exc.value.status_code == 404

    def test_delete_row_success(self, service: SupabaseService, ensure_configured: None) -> None:
        """delete_row should return None on success."""
        with patch("app.services.supabase._client.request") as mock_request:
            mock_request.return_value.status_code = 200
            mock_request.return_value.json.return_value = [{"id": str(uuid4())}]

            result = service.delete_row("empresas", uuid4())
            assert result is None

    def test_delete_row_not_found(self, service: SupabaseService, ensure_configured: None) -> None:
        """delete_row should raise 404 when row is not found."""
        with patch("app.services.supabase._client.request") as mock_request:
            mock_request.return_value.status_code = 200
            mock_request.return_value.json.return_value = []

            with pytest.raises(HTTPException) as exc:
                service.delete_row("empresas", uuid4())
            assert exc.value.status_code == 404

    def test_request_error_raises_bad_gateway(self, service: SupabaseService, ensure_configured: None) -> None:
        """Should raise 502 on connection error."""
        with patch("app.services.supabase._client.request") as mock_request:
            mock_request.side_effect = httpx.RequestError("Connection failed")

            with pytest.raises(HTTPException) as exc:
                service.list_rows("empresas")
            assert exc.value.status_code == 502

    def test_headers_with_accept_object(self, service: SupabaseService, ensure_configured: None) -> None:
        """_headers should include Accept header for object response when requested."""
        headers = service._headers(accept_object=True)
        assert headers["Accept"] == "application/vnd.pgrst.object+json"

    def test_headers_with_prefer(self, service: SupabaseService, ensure_configured: None) -> None:
        """_headers should include Prefer header when provided."""
        headers = service._headers(prefer="return=representation")
        assert headers["Prefer"] == "return=representation"

    def test_signup_user_success(self, service: SupabaseService, ensure_configured: None) -> None:
        """signup_user should return user data on success."""
        mock_response = {"user": {"id": str(uuid4())}}
        with patch("app.services.supabase._client.post") as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = mock_response

            result = service.signup_user("test@email.com", "Senha@123")
            assert result == mock_response

    def test_signup_user_auth_error(self, service: SupabaseService, ensure_configured: None) -> None:
        """signup_user should raise HTTPException on auth error."""
        with patch("app.services.supabase._client.post") as mock_post:
            mock_post.return_value.status_code = 400
            mock_post.return_value.json.return_value = {"message": "Email already registered"}

            with pytest.raises(HTTPException) as exc:
                service.signup_user("existing@email.com", "Senha@123")
            assert exc.value.status_code == 400

    def test_signup_user_not_configured(self, service: SupabaseService) -> None:
        """signup_user should raise 503 when Supabase is not configured."""
        with (
            patch("app.services.supabase.settings.supabase_url", None),
            patch("app.services.supabase.settings.supabase_key", None),
        ):
            with pytest.raises(HTTPException) as exc:
                service.signup_user("test@email.com", "Senha@123")
            assert exc.value.status_code == 503

    def test_signup_user_request_error(self, service: SupabaseService, ensure_configured: None) -> None:
        """signup_user should raise 502 on connection error."""
        with patch("app.services.supabase._client.post") as mock_post:
            mock_post.side_effect = httpx.RequestError("Connection error")

            with pytest.raises(HTTPException) as exc:
                service.signup_user("test@email.com", "Senha@123")
            assert exc.value.status_code == 502

    def test_signup_user_unexpected_error(self, service: SupabaseService, ensure_configured: None) -> None:
        """signup_user should raise 500 on unexpected error."""
        with patch("app.services.supabase._client.post") as mock_post:
            mock_post.side_effect = RuntimeError("Something unexpected")

            with pytest.raises(HTTPException) as exc:
                service.signup_user("test@email.com", "Senha@123")
            assert exc.value.status_code == 500

    def test_recover_password_success(self, service: SupabaseService, ensure_configured: None) -> None:
        """recover_password should return response on success."""
        mock_response = {"message": "Recovery email sent"}
        with patch("app.services.supabase._client.post") as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = mock_response

            result = service.recover_password("user@email.com")
            assert result == mock_response

    def test_recover_password_with_redirect(self, service: SupabaseService, ensure_configured: None) -> None:
        """recover_password should include redirectTo when provided."""
        with patch("app.services.supabase._client.post") as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = {}

            service.recover_password("user@email.com", redirect_to="https://app.com/reset")
            # Verify the JSON payload includes data.redirectTo
            _, kwargs = mock_post.call_args
            assert kwargs["json"]["data"]["redirectTo"] == "https://app.com/reset"

    def test_recover_password_error(self, service: SupabaseService, ensure_configured: None) -> None:
        """recover_password should raise HTTPException on error."""
        with patch("app.services.supabase._client.post") as mock_post:
            mock_post.return_value.status_code = 400
            mock_post.return_value.json.return_value = {"message": "User not found"}

            with pytest.raises(HTTPException) as exc:
                service.recover_password("unknown@email.com")
            assert exc.value.status_code == 400

    def test_verify_otp_success(self, service: SupabaseService, ensure_configured: None) -> None:
        """verify_otp should return session data on success."""
        mock_response = {"access_token": "fake-token"}
        with patch("app.services.supabase._client.post") as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = mock_response

            result = service.verify_otp("user@email.com", "123456", type="recovery")
            assert result == mock_response

    def test_verify_otp_without_email(self, service: SupabaseService, ensure_configured: None) -> None:
        """verify_otp should work without email."""
        with patch("app.services.supabase._client.post") as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = {}

            service.verify_otp(None, "token123", type="recovery")
            _, kwargs = mock_post.call_args
            # email should not be in the JSON payload when None
            assert "email" not in kwargs["json"]

    def test_verify_otp_error(self, service: SupabaseService, ensure_configured: None) -> None:
        """verify_otp should raise HTTPException on error."""
        with patch("app.services.supabase._client.post") as mock_post:
            mock_post.return_value.status_code = 401
            mock_post.return_value.json.return_value = {"message": "Invalid token"}

            with pytest.raises(HTTPException) as exc:
                service.verify_otp("user@email.com", "bad-token")
            assert exc.value.status_code == 401

    def test_update_user_password_success(self, service: SupabaseService, ensure_configured: None) -> None:
        """update_user_password should return updated user data."""
        mock_response = {"id": str(uuid4()), "email": "user@email.com"}
        with patch("app.services.supabase._client.put") as mock_put:
            mock_put.return_value.status_code = 200
            mock_put.return_value.json.return_value = mock_response

            result = service.update_user_password("fake-token", "NovaSenha@123")
            assert result == mock_response

    def test_update_user_password_error(self, service: SupabaseService, ensure_configured: None) -> None:
        """update_user_password should raise HTTPException on error."""
        with patch("app.services.supabase._client.put") as mock_put:
            mock_put.return_value.status_code = 400
            mock_put.return_value.json.return_value = {"message": "Weak password"}

            with pytest.raises(HTTPException) as exc:
                service.update_user_password("fake-token", "123")
            assert exc.value.status_code == 400

    # ---------- ValueError branches (non-JSON error responses) ----------

    def test_list_rows_error_non_json(self, service: SupabaseService, ensure_configured: None) -> None:
        """_request should handle non-JSON error response."""
        with patch("app.services.supabase._client.request") as mock_request:
            mock_request.return_value.status_code = 500
            mock_request.return_value.json.side_effect = ValueError("Not JSON")

            with pytest.raises(HTTPException) as exc:
                service.list_rows("empresas")
            assert exc.value.status_code == 500

    def test_get_row_406_not_found(self, service: SupabaseService, ensure_configured: None) -> None:
        """_request with 406 should map to 404."""
        with patch("app.services.supabase._client.request") as mock_request:
            mock_request.return_value.status_code = 406
            mock_request.return_value.json.return_value = {}

            with pytest.raises(HTTPException) as exc:
                service.get_row("empresas", uuid4())
            assert exc.value.status_code == 404

    def test_signup_user_auth_error_non_json(self, service: SupabaseService, ensure_configured: None) -> None:
        """signup_user should handle non-JSON error response."""
        with patch("app.services.supabase._client.post") as mock_post:
            mock_post.return_value.status_code = 400
            mock_post.return_value.json.side_effect = ValueError("Not JSON")

            with pytest.raises(HTTPException) as exc:
                service.signup_user("test@email.com", "Senha@123")
            assert exc.value.status_code == 400

    def test_recover_password_error_non_json(self, service: SupabaseService, ensure_configured: None) -> None:
        """recover_password should handle non-JSON error response."""
        with patch("app.services.supabase._client.post") as mock_post:
            mock_post.return_value.status_code = 400
            mock_post.return_value.json.side_effect = ValueError("Not JSON")

            with pytest.raises(HTTPException) as exc:
                service.recover_password("unknown@email.com")
            assert exc.value.status_code == 400

    def test_verify_otp_error_non_json(self, service: SupabaseService, ensure_configured: None) -> None:
        """verify_otp should handle non-JSON error response."""
        with patch("app.services.supabase._client.post") as mock_post:
            mock_post.return_value.status_code = 401
            mock_post.return_value.json.side_effect = ValueError("Not JSON")

            with pytest.raises(HTTPException) as exc:
                service.verify_otp("user@email.com", "bad-token")
            assert exc.value.status_code == 401

    def test_update_user_password_error_non_json(self, service: SupabaseService, ensure_configured: None) -> None:
        """update_user_password should handle non-JSON error response."""
        with patch("app.services.supabase._client.put") as mock_put:
            mock_put.return_value.status_code = 400
            mock_put.return_value.json.side_effect = ValueError("Not JSON")

            with pytest.raises(HTTPException) as exc:
                service.update_user_password("fake-token", "123")
            assert exc.value.status_code == 400
