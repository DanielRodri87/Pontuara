from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.schemas.projeto import ProjetoCreate, ProjetoRead, ProjetoUpdate
from app.services.supabase import supabase_service

router = APIRouter(prefix="/projetos", tags=["projetos"])


@router.post("/", response_model=ProjetoRead, status_code=status.HTTP_201_CREATED)
def create_projeto(payload: ProjetoCreate) -> ProjetoRead:
    """Cria um projeto no Supabase."""
    projeto = supabase_service.create_row(
        settings.supabase_projetos_table,
        payload.model_dump(mode="json", exclude_none=True),
    )
    return ProjetoRead.model_validate(projeto)


@router.get("/", response_model=list[ProjetoRead])
def list_projetos() -> list[ProjetoRead]:
    """Lista os projetos cadastrados no Supabase."""
    projetos = supabase_service.list_rows(settings.supabase_projetos_table)
    return [ProjetoRead.model_validate(projeto) for projeto in projetos]


@router.get("/{projeto_id}", response_model=ProjetoRead)
def get_projeto(projeto_id: UUID) -> ProjetoRead:
    """Busca um projeto por identificador."""
    projeto = supabase_service.get_row(settings.supabase_projetos_table, projeto_id)
    return ProjetoRead.model_validate(projeto)


@router.put("/{projeto_id}", response_model=ProjetoRead)
def update_projeto(projeto_id: UUID, payload: ProjetoUpdate) -> ProjetoRead:
    """Atualiza parcialmente um projeto no Supabase."""
    atualizacoes = payload.model_dump(mode="json", exclude_unset=True)
    if not atualizacoes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nenhum campo enviado para atualização")
    projeto = supabase_service.update_row(settings.supabase_projetos_table, projeto_id, atualizacoes)
    return ProjetoRead.model_validate(projeto)


@router.delete("/{projeto_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_projeto(projeto_id: UUID) -> None:
    """Remove um projeto no Supabase."""
    supabase_service.delete_row(settings.supabase_projetos_table, projeto_id)
    return None
