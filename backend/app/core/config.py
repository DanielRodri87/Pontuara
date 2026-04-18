import os
from functools import lru_cache

from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()


class Settings(BaseModel):
    """Define configurações centrais da aplicação.

    Args:
        app_name: Nome público da aplicação.
        app_version: Versão atual da API.
        supabase_url: URL base do projeto Supabase.
        supabase_key: Chave de acesso utilizada na API REST do Supabase.
        supabase_schema: Schema utilizado nas requisições ao Supabase.
        supabase_timeout: Tempo limite das requisições HTTP.
        supabase_usuarios_table: Nome da tabela de usuários.
        supabase_trabalhos_table: Nome da tabela de trabalhos.
        supabase_expedientes_table: Nome da tabela de expedientes.

    Returns:
        None: Classe de configuração central da aplicação.
    """

    app_name: str = "Pontuara API"
    app_version: str = "0.1.0"
    supabase_url: str | None = None
    supabase_key: str | None = None
    supabase_schema: str = "public"
    supabase_timeout: float = Field(default=15.0, gt=0)
    supabase_usuarios_table: str = "usuarios"
    supabase_trabalhos_table: str = "trabalhos"
    supabase_expedientes_table: str = "expedientes"

    @property
    def supabase_rest_url(self) -> str | None:
        """Monta a URL base da API REST do Supabase.

        Args:
            None.

        Returns:
            str | None: URL REST completa do Supabase quando configurada.
        """
        if not self.supabase_url:
            return None
        return f"{self.supabase_url.rstrip('/')}/rest/v1"

    @property
    def supabase_configured(self) -> bool:
        """Indica se as credenciais mínimas do Supabase foram definidas.

        Args:
            None.

        Returns:
            bool: `True` quando URL e chave do Supabase estão configuradas.
        """
        return bool(self.supabase_rest_url and self.supabase_key)


@lru_cache
def get_settings() -> Settings:
    """Carrega as configurações da aplicação a partir do ambiente.

    Args:
        None.

    Returns:
        Settings: Objeto consolidado com as configurações da aplicação.
    """
    return Settings(
        app_name=os.getenv("APP_NAME", "Pontuara API"),
        app_version=os.getenv("APP_VERSION", "0.1.0"),
        supabase_url=os.getenv("SUPABASE_URL"),
        supabase_key=os.getenv("SUPABASE_KEY"),
        supabase_schema=os.getenv("SUPABASE_SCHEMA", "public"),
        supabase_timeout=float(os.getenv("SUPABASE_TIMEOUT", "15")),
        supabase_usuarios_table=os.getenv("SUPABASE_USUARIOS_TABLE", "usuarios"),
        supabase_trabalhos_table=os.getenv("SUPABASE_TRABALHOS_TABLE", "trabalhos"),
        supabase_expedientes_table=os.getenv("SUPABASE_EXPEDIENTES_TABLE", "expedientes"),
    )


settings = get_settings()
