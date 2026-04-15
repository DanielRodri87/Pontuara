from pydantic import BaseModel


class Settings(BaseModel):
    """Define configurações centrais da aplicação.

    Args:
        app_name: Nome público da aplicação.
        app_version: Versão atual da API.

    Returns:
        None: Classe de configuração da aplicação.
    """

    app_name: str = "Pontuara API"
    app_version: str = "0.1.0"


settings = Settings()
