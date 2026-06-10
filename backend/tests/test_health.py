"""Tests for the health check endpoint."""

from fastapi.testclient import TestClient


class TestHealth:
    """Health endpoint test suite."""

    def test_health_ok(self, client: TestClient) -> None:
        """GET /health should return 200 with status ok."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "supabase_configured" in data

    def test_health_method_not_allowed(self, client: TestClient) -> None:
        """POST /health should return 405."""
        response = client.post("/health")
        assert response.status_code == 405
