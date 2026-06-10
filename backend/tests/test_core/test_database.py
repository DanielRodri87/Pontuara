"""Tests for the database core module (get_db generator)."""

from unittest.mock import MagicMock, patch

from app.core.database import get_db


class TestGetDb:
    """get_db generator tests."""

    def test_get_db_yields_session_and_closes(self) -> None:
        """Should yield a session and close it after use."""
        mock_session = MagicMock()

        with patch("app.core.database.SessionLocal", return_value=mock_session):
            gen = get_db()
            session = next(gen)
            assert session is mock_session

            # After the generator is exhausted (via close or StopIteration),
            # the session should be closed
            with patch.object(mock_session, "close") as mock_close:
                try:
                    next(gen)
                except StopIteration:
                    pass
                mock_close.assert_called_once()
