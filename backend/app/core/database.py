import os
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/pontuara")

engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Fornece sessão de banco por requisição.

    Args:
        None.

    Returns:
        Generator[Session, None, None]: Gerador que entrega uma sessão SQLAlchemy ativa.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
