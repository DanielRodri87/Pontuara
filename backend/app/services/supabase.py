from uuid import UUID

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class SupabaseService:
    """Cliente mínimo para operar via REST com tabelas do Supabase.

    Args:
        None.

    Returns:
        None: Serviço reutilizável para operações CRUD no Supabase.
    """

    def _ensure_configured(self) -> tuple[str, str]:
        """Valida se o Supabase foi configurado no ambiente.

        Args:
            None.

        Returns:
            tuple[str, str]: URL REST do Supabase e chave de acesso configuradas.

        Raises:
            HTTPException: Quando a configuração obrigatória não foi preenchida.
        """
        if not settings.supabase_rest_url or not settings.supabase_key:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Supabase não configurado. Preencha SUPABASE_URL e SUPABASE_KEY no .env.",
            )
        return settings.supabase_rest_url, settings.supabase_key

    def _headers(self, *, prefer: str | None = None, accept_object: bool = False) -> dict[str, str]:
        """Monta os cabeçalhos usados nas requisições ao Supabase.

        Args:
            prefer: Valor opcional do cabeçalho `Prefer`.
            accept_object: Indica se a resposta deve retornar um único objeto.

        Returns:
            dict[str, str]: Cabeçalhos HTTP necessários para autenticação e perfil.
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
        """Executa uma requisição HTTP contra a API REST do Supabase.

        Args:
            method: Método HTTP utilizado na requisição.
            table: Nome da tabela alvo no Supabase.
            params: Parâmetros de consulta enviados na URL.
            json: Corpo JSON enviado na requisição, quando aplicável.
            prefer: Valor opcional do cabeçalho `Prefer`.
            accept_object: Indica se a resposta deve ser tratada como objeto único.

        Returns:
            httpx.Response: Resposta HTTP retornada pelo Supabase.

        Raises:
            HTTPException: Quando há falha de conexão ou erro retornado pelo Supabase.
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
        """Lista todos os registros de uma tabela no Supabase.

        Args:
            table: Nome da tabela consultada.

        Returns:
            list[dict[str, object]]: Lista de registros retornados pelo Supabase.
        """
        response = self._request("GET", table, params={"select": "*"})
        return response.json()

    def get_row(self, table: str, item_id: UUID) -> dict[str, object]:
        """Busca um registro específico por identificador.

        Args:
            table: Nome da tabela consultada.
            item_id: Identificador UUID do registro.

        Returns:
            dict[str, object]: Registro retornado pelo Supabase.
        """
        response = self._request(
            "GET",
            table,
            params={"select": "*", "id": f"eq.{item_id}"},
            accept_object=True,
        )
        return response.json()

    def get_user_by_email(self, table: str, email: str) -> dict[str, object] | None:
        """Busca um usuário pelo e-mail.

        Args:
            table: Nome da tabela consultada.
            email: E-mail do usuário.

        Returns:
            dict[str, object] | None: Registro do usuário ou None se não encontrado.
        """
        response = self._request(
            "GET",
            table,
            params={"select": "*", "email": f"eq.{email}"},
            accept_object=False, # Pode retornar lista vazia
        )
        data = response.json()
        return data[0] if data else None

    def create_row(self, table: str, payload: dict[str, object]) -> dict[str, object]:
        """Cria um novo registro em uma tabela do Supabase.

        Args:
            table: Nome da tabela de destino.
            payload: Dados do registro a ser criado.

        Returns:
            dict[str, object]: Registro criado e devolvido pelo Supabase.
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
        """Atualiza um registro existente em uma tabela do Supabase.

        Args:
            table: Nome da tabela de destino.
            item_id: Identificador UUID do registro.
            payload: Campos e valores a serem atualizados.

        Returns:
            dict[str, object]: Registro atualizado retornado pelo Supabase.

        Raises:
            HTTPException: Quando o registro não é encontrado.
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
        """Remove um registro de uma tabela do Supabase.

        Args:
            table: Nome da tabela de destino.
            item_id: Identificador UUID do registro.

        Returns:
            None: Não retorna conteúdo quando a remoção é concluída.

        Raises:
            HTTPException: Quando o registro não é encontrado.
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
        """Autentica um utilizador através da API Auth do Supabase.

        Args:
            email: O e-mail do utilizador.
            password: A palavra-passe do utilizador.

        Returns:
            dict[str, object]: Dados da sessão (incluindo access_token) retornados pelo Supabase.
            
        Raises:
            HTTPException: Quando as credenciais são inválidas ou há falha na comunicação.
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
        """Cria um novo utilizador no Supabase Auth (signup).

        Args:
            email: O e-mail do novo utilizador.
            password: A palavra-passe do novo utilizador.

        Returns:
            dict[str, object]: Dados do usuário criado retornados pelo Supabase Auth.
            
        Raises:
            HTTPException: Quando há erro na criação (ex: email já existe).
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
        """Inicia o processo de recuperação de senha enviando um e-mail.

        Args:
            email: O e-mail do utilizador.
            redirect_to: URL opcional para redirecionamento após clicar no link.

        Returns:
            dict[str, object]: Resposta do Supabase Auth.
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
        """Verifica um código OTP ou token de recuperação.

        Args:
            email: O e-mail do utilizador (opcional para alguns tipos).
            token: O código ou token recebido.
            type: O tipo de verificação (default: "recovery").

        Returns:
            dict[str, object]: Dados da sessão (incluindo access_token).
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
        """Atualiza a senha do utilizador autenticado.

        Args:
            access_token: Token de acesso do utilizador.
            new_password: A nova senha.

        Returns:
            dict[str, object]: Dados do usuário atualizado.
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
                # Tenta pegar a mensagem de erro específica do Supabase
                if isinstance(payload, dict):
                    error_detail = payload.get("message") or payload.get("error_description") or payload.get("msg") or error_detail
            except ValueError:
                pass
            raise HTTPException(status_code=response.status_code, detail=error_detail)
            
        return response.json()


supabase_service = SupabaseService()
