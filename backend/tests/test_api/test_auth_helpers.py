"""Direct unit tests for helper functions in app.api.v1.endpoints.auth."""

import pytest

from app.api.v1.endpoints.auth import _validate_password, validate_telefone


class TestValidateTelefone:
    """Tests for the validate_telefone helper function."""

    def test_none_returns_none(self) -> None:
        """Should return None when input is None."""
        assert validate_telefone(None) is None

    def test_empty_string_returns_none(self) -> None:
        """Should return None when input is empty string."""
        assert validate_telefone("") is None

    def test_only_non_digits_returns_none(self) -> None:
        """Should return None when input has no digits."""
        assert validate_telefone("abc-()") is None

    def test_10_digits_formats_correctly(self) -> None:
        """Should format 10-digit number as (XX) XXXX-XXXX."""
        result = validate_telefone("1198765432")
        assert result == "(11) 9876-5432"

    def test_11_digits_formats_correctly(self) -> None:
        """Should format 11-digit number as (XX) XXXXX-XXXX."""
        result = validate_telefone("11987654321")
        assert result == "(11) 98765-4321"

    def test_input_with_special_chars(self) -> None:
        """Should strip non-digit characters and format."""
        result = validate_telefone("(11) 9 8765-4321")
        assert result == "(11) 98765-4321"

    def test_invalid_short_number(self) -> None:
        """Should raise ValueError for phone with less than 10 digits."""
        with pytest.raises(ValueError, match="10 ou 11 dígitos"):
            validate_telefone("119876543")

    def test_invalid_long_number(self) -> None:
        """Should raise ValueError for phone with more than 11 digits."""
        with pytest.raises(ValueError, match="10 ou 11 dígitos"):
            validate_telefone("119876543210")


class TestValidatePassword:
    """Tests for the _validate_password helper function."""

    def test_valid_password(self) -> None:
        """Should return the password when it meets all requirements."""
        result = _validate_password("SenhaForte@123")
        assert result == "SenhaForte@123"

    def test_too_short(self) -> None:
        """Should raise ValueError for password shorter than 8 chars."""
        with pytest.raises(ValueError, match="mínimo 8 caracteres"):
            _validate_password("Ab@1")

    def test_missing_lowercase(self) -> None:
        """Should raise ValueError when password has no lowercase letter."""
        with pytest.raises(ValueError, match="letra minúscula"):
            _validate_password("SENHA@123")

    def test_missing_uppercase(self) -> None:
        """Should raise ValueError when password has no uppercase letter."""
        with pytest.raises(ValueError, match="letra maiúscula"):
            _validate_password("senha@123")

    def test_missing_digit(self) -> None:
        """Should raise ValueError when password has no digit."""
        with pytest.raises(ValueError, match="número"):
            _validate_password("Senha@Forte")

    def test_missing_special_char(self) -> None:
        """Should raise ValueError when password has no special character."""
        with pytest.raises(ValueError, match="caractere especial"):
            _validate_password("SenhaForte1")
