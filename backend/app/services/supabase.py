from uuid import UUID

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class SupabaseService:
    """Minimal client to operate via REST with Supabase tables.

    Args:
        None.

    Returns:
        None: Reusable service for CRUD operations in Supabase.
    """

    def _ensure_configured(self) -> tuple[str, str]:
        """Validate that Supabase is configured in the environment.

        Args:
            None.

        Returns:
            tuple[str, str]: Configured Supabase REST URL and access key.

        Raises:
            HTTPException: When required configuration is missing.
        """
        if not settings.supabase_rest_url or not settings.supabase_key:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Supabase não configurado. Preencha SUPABASE_URL e SUPABASE_KEY no .env.",
            )
        return settings.supabase_rest_url, settings.supabase_key

    def _headers(self, *, prefer: str | None = None, accept_object: bool = False) -> dict[str, str]:
        """Build headers used in Supabase requests.

        Args:
            prefer: Optional value for the `Prefer` header.
            accept_object: Whether the response should return a single object.

        Returns:
            dict[str, str]: HTTP headers required for auth and profile.
        """
        _, supabase_key = self._ensure_configured()
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json",
            "Accept-Profile": settings.supabase_schema,
            "Content-Profile": settings.supabase_schema,
        }
        if prefer:
            headers["Prefer"] = prefer
        if accept_object:
            headers["Accept"] = "application/vnd.pgrst.object+json"
        return headers

    def _request(
        self,
        method: str,
        table: str,
        *,
        params: dict[str, str] | None = None,
        json: dict[str, object] | None = None,
        prefer: str | None = None,
        accept_object: bool = False,
    ) -> httpx.Response:
        """Execute an HTTP request against the Supabase REST API.

        Args:
            method: HTTP method used in the request.
            table: Target table name in Supabase.
            params: Query params sent in the URL.
            json: JSON body sent in the request, when applicable.
            prefer: Optional value for the `Prefer` header.
            accept_object: Whether the response should be treated as a single object.

        Returns:
            httpx.Response: HTTP response returned by Supabase.

        Raises:
            HTTPException: When connection fails or Supabase returns an error.
        """
        rest_url, _ = self._ensure_configured()
        try:
            response = httpx.request(
                method=method,
                url=f"{rest_url}/{table}",
                headers=self._headers(prefer=prefer, accept_object=accept_object),
                params=params,
                json=json,
                timeout=settings.supabase_timeout,
            )
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Não foi possível conectar ao Supabase: {exc}",
            ) from exc

        if response.status_code >= 400:
            detail = "Erro ao comunicar com o Supabase."
            try:
                payload = response.json()
            except ValueError:
                payload = None
            if isinstance(payload, dict):
                detail = payload.get("message") or payload.get("error_description") or payload.get("hint") or detail
            if response.status_code in {404, 406}:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro não encontrado")
            raise HTTPException(status_code=response.status_code, detail=detail)

        return response

    def list_rows(self, table: str) -> list[dict[str, object]]:
        """List all records from a Supabase table.

        Args:
            table: Table name to query.

        Returns:
            list[dict[str, object]]: List of records returned by Supabase.
        """
        response = self._request("GET", table, params={"select": "*"})
        return response.json()

    def get_row(self, table: str, item_id: UUID) -> dict[str, object]:
        """Fetch a specific record by identifier.

        Args:
            table: Table name to query.
            item_id: Record UUID identifier.

        Returns:
            dict[str, object]: Record returned by Supabase.
        """
        response = self._request(
            "GET",
            table,
            params={"select": "*", "id": f"eq.{item_id}"},
            accept_object=True,
        )
        return response.json()

    def get_user_by_email(self, table: str, email: str) -> dict[str, object] | None:
        """Fetch a user by email.

        Args:
            table: Table name to query.
            email: User email.

        Returns:
            dict[str, object] | None: User record or None if not found.
        """
        response = self._request(
            "GET",
            table,
            params={"select": "*", "email": f"eq.{email}"},
            accept_object=False, # May return an empty list
        )
        data = response.json()
        return data[0] if data else None

    def create_row(self, table: str, payload: dict[str, object]) -> dict[str, object]:
        """Create a new record in a Supabase table.

        Args:
            table: Target table name.
            payload: Data for the record to be created.

        Returns:
            dict[str, object]: Record created and returned by Supabase.
        """
        response = self._request(
            "POST",
            table,
            json=payload,
            prefer="return=representation",
        )
        data = response.json()
        return data[0]

    def update_row(self, table: str, item_id: UUID, payload: dict[str, object]) -> dict[str, object]:
        """Update an existing record in a Supabase table.

        Args:
            table: Target table name.
            item_id: Record UUID identifier.
            payload: Fields and values to update.

        Returns:
            dict[str, object]: Updated record returned by Supabase.

        Raises:
            HTTPException: When the record is not found.
        """
        response = self._request(
            "PATCH",
            table,
            params={"id": f"eq.{item_id}"},
            json=payload,
            prefer="return=representation",
        )
        data = response.json()
        if not data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro não encontrado")
        return data[0]

    def delete_row(self, table: str, item_id: UUID) -> None:
        """Remove a record from a Supabase table.

        Args:
            table: Target table name.
            item_id: Record UUID identifier.

        Returns:
            None: No content is returned when deletion completes.

        Raises:
            HTTPException: When the record is not found.
        """
        response = self._request(
            "DELETE",
            table,
            params={"id": f"eq.{item_id}"},
            prefer="return=representation",
        )
        data = response.json()
        if not data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro não encontrado")

    def login_user(self, email: str, password: str) -> dict[str, object]:
        """Authenticate a user through the Supabase Auth API.

        Args:
            email: User email.
            password: User password.

        Returns:
            dict[str, object]: Session data (including access_token) returned by Supabase.
            
        Raises:
            HTTPException: When credentials are invalid or communication fails.
        """
        if not settings.supabase_url or not settings.supabase_key:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Supabase não configurado.",
            )

        auth_url = f"{settings.supabase_url.rstrip('/')}/auth/v1/token"
        
        headers = {
            "apikey": settings.supabase_key,
            "Content-Type": "application/json",
        }
        
        try:
            response = httpx.post(
                auth_url,
                params={"grant_type": "password"},
                headers=headers,
                json={"email": email, "password": password},
                timeout=settings.supabase_timeout,
            )
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Não foi possível conectar ao Supabase Auth: {exc}",
            ) from exc

        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="E-mail ou palavra-passe incorretos."
            )

        return response.json()

    def signup_user(self, email: str, password: str) -> dict[str, object]:
        """Create a new user in Supabase Auth (signup).

        Args:
            email: New user email.
            password: New user password.

        Returns:
            dict[str, object]: Created user data returned by Supabase Auth.
            
        Raises:
            HTTPException: When creation fails (e.g., email already exists).
        """
        try:
            if not settings.supabase_url or not settings.supabase_key:
                logger.error("Supabase não está configurado")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Supabase não configurado.",
                )

            auth_url = f"{settings.supabase_url.rstrip('/')}/auth/v1/signup"
            logger.info(f"Tentando criar usuário em: {auth_url}")
            
            headers = {
                "apikey": settings.supabase_key,
                "Content-Type": "application/json",
            }
            
            logger.info(f"Enviando requisição POST para signup com email: {email}")
            response = httpx.post(
                auth_url,
                headers=headers,
                json={"email": email, "password": password},
                timeout=settings.supabase_timeout,
            )
            logger.info(f"Resposta do Supabase Auth: status={response.status_code}")
            
            if response.status_code >= 400:
                error_detail = "Erro ao criar usuário. E-mail pode já estar registrado."
                try:
                    payload = response.json()
                    logger.error(f"Erro ao criar usuário: {payload}")
                    if isinstance(payload, dict):
                        error_detail = payload.get("message") or payload.get("error_description") or error_detail
                except ValueError:
                    logger.error(f"Não foi possível parsear resposta de erro: {response.text}")
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=error_detail
                )

            result = response.json()
            logger.info(f"Usuário criado com sucesso no Auth: {result}")
            return result
            
        except HTTPException as e:
            logger.error(f"HTTPException durante signup: {e.detail}")
            raise e
        except httpx.RequestError as exc:
            logger.error(f"Erro de conexão com Supabase: {exc}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Não foi possível conectar ao Supabase Auth: {exc}",
            ) from exc
        except Exception as e:
            logger.error(f"Erro inesperado durante signup: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro inesperado ao criar usuário: {str(e)}"
            )

    def recover_password(self, email: str, redirect_to: str | None = None) -> dict[str, object]:
        """Start password recovery by sending an email.

        Args:
            email: User email.
            redirect_to: Optional URL to redirect after clicking the link.

        Returns:
            dict[str, object]: Supabase Auth response.
        """
        auth_url = f"{settings.supabase_url.rstrip('/')}/auth/v1/recover"
        headers = {
            "apikey": settings.supabase_key,
            "Content-Type": "application/json",
        }
        
        json_payload = {"email": email}
        if redirect_to:
            json_payload["data"] = {"redirectTo": redirect_to}
        
        response = httpx.post(
            auth_url,
            headers=headers,
            json=json_payload,
            timeout=settings.supabase_timeout,
        )
        
        if response.status_code >= 400:
            error_detail = "Erro ao solicitar recuperação de senha."
            try:
                payload = response.json()
                error_detail = payload.get("message") or error_detail
            except ValueError:
                pass
            raise HTTPException(status_code=response.status_code, detail=error_detail)
            
        return response.json()

    def verify_otp(self, email: str | None, token: str, type: str = "recovery") -> dict[str, object]:
        """Verify an OTP code or recovery token.

        Args:
            email: User email (optional for some types).
            token: Received code or token.
            type: Verification type (default: "recovery").

        Returns:
            dict[str, object]: Session data (including access_token).
        """
        auth_url = f"{settings.supabase_url.rstrip('/')}/auth/v1/verify"
        headers = {
            "apikey": settings.supabase_key,
            "Content-Type": "application/json",
        }
        
        payload = {"token": token, "type": type}
        if email:
            payload["email"] = email
            
        response = httpx.post(
            auth_url,
            headers=headers,
            json=payload,
            timeout=settings.supabase_timeout,
        )
        
        if response.status_code >= 400:
            error_detail = "Código inválido ou expirado."
            try:
                payload = response.json()
                error_detail = payload.get("message") or error_detail
            except ValueError:
                pass
            raise HTTPException(status_code=response.status_code, detail=error_detail)
            
        return response.json()

    def update_user_password(self, access_token: str, new_password: str) -> dict[str, object]:
        """Update the authenticated user's password.

        Args:
            access_token: User access token.
            new_password: New password.

        Returns:
            dict[str, object]: Updated user data.
        """
        auth_url = f"{settings.supabase_url.rstrip('/')}/auth/v1/user"
        headers = {
            "apikey": settings.supabase_key,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }
        
        response = httpx.put(
            auth_url,
            headers=headers,
            json={"password": new_password},
            timeout=settings.supabase_timeout,
        )
        
        if response.status_code >= 400:
            logger.error(f"Erro do Supabase Auth ({response.status_code}): {response.text}")
            error_detail = f"Erro ao atualizar senha (Status {response.status_code})"
            try:
                payload = response.json()
                # Try to extract a Supabase-specific error message
                if isinstance(payload, dict):
                    error_detail = payload.get("message") or payload.get("error_description") or payload.get("msg") or error_detail
            except ValueError:
                pass
            raise HTTPException(status_code=response.status_code, detail=error_detail)
            
        return response.json()


supabase_service = SupabaseService()
