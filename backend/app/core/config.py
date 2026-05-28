import os
from functools import lru_cache

from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()


class Settings(BaseModel):
    """Define the application's core settings.

    Args:
        app_name: Public application name.
        app_version: Current API version.
        supabase_url: Base URL for the Supabase project.
        supabase_key: Access key used by the Supabase REST API.
        supabase_schema: Schema used in Supabase requests.
        supabase_timeout: HTTP request timeout.
        supabase_usuarios_table: Users table name.
        supabase_trabalhos_table: Jobs table name.
        supabase_empresas_table: Companies table name.
        supabase_projetos_table: Projects table name.

    Returns:
        None: Central settings class for the application.
    """

    app_name: str = "Pontuara API"
    app_version: str = "0.1.0"
    supabase_url: str | None = None
    supabase_key: str | None = None
    supabase_schema: str = "public"
    supabase_timeout: float = Field(default=15.0, gt=0)
    supabase_usuarios_table: str = "usuarios"
    supabase_trabalhos_table: str = "trabalhos"
    supabase_empresas_table: str = "empresas"
    supabase_projetos_table: str = "projetos"

    @property
    def supabase_rest_url(self) -> str | None:
        """Build the Supabase REST API base URL.

        Args:
            None.

        Returns:
            str | None: Full Supabase REST URL when configured.
        """
        if not self.supabase_url:
            return None
        return f"{self.supabase_url.rstrip('/')}/rest/v1"

    @property
    def supabase_configured(self) -> bool:
        """Indicate whether minimal Supabase credentials are set.

        Args:
            None.

        Returns:
            bool: `True` when the Supabase URL and key are configured.
        """
        return bool(self.supabase_rest_url and self.supabase_key)


@lru_cache
def get_settings() -> Settings:
    """Load application settings from the environment.

    Args:
        None.

    Returns:
        Settings: Consolidated application settings object.
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
        supabase_empresas_table=os.getenv("SUPABASE_EMPRESAS_TABLE", "empresas"),
        supabase_projetos_table=os.getenv("SUPABASE_PROJETOS_TABLE", "projetos"),
    )


settings = get_settings()
