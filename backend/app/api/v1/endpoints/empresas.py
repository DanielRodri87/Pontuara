from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.schemas.empresa import EmpresaCreate, EmpresaRead, EmpresaUpdate
from app.services.supabase import supabase_service

router = APIRouter(prefix="/empresas", tags=["empresas"])


@router.post("/", response_model=EmpresaRead, status_code=status.HTTP_201_CREATED)
def create_empresa(payload: EmpresaCreate) -> EmpresaRead:
    """Cria uma empresa no Supabase."""
    empresa = supabase_service.create_row(
        settings.supabase_empresas_table,
        payload.model_dump(mode="json"),
    )
    return EmpresaRead.model_validate(empresa)


@router.get("/", response_model=list[EmpresaRead])
def list_empresas() -> list[EmpresaRead]:
    """Lista as empresas cadastradas no Supabase."""
    empresas = supabase_service.list_rows(settings.supabase_empresas_table)
    return [EmpresaRead.model_validate(empresa) for empresa in empresas]


@router.get("/{empresa_id}", response_model=EmpresaRead)
def get_empresa(empresa_id: UUID) -> EmpresaRead:
    """Busca uma empresa por identificador."""
    empresa = supabase_service.get_row(settings.supabase_empresas_table, empresa_id)
    return EmpresaRead.model_validate(empresa)


@router.put("/{empresa_id}", response_model=EmpresaRead)
def update_empresa(empresa_id: UUID, payload: EmpresaUpdate) -> EmpresaRead:
    """Atualiza parcialmente uma empresa no Supabase."""
    atualizacoes = payload.model_dump(mode="json", exclude_unset=True)
    if not atualizacoes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nenhum campo enviado para atualização")
    empresa = supabase_service.update_row(settings.supabase_empresas_table, empresa_id, atualizacoes)
    return EmpresaRead.model_validate(empresa)


@router.delete("/{empresa_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_empresa(empresa_id: UUID) -> None:
    """Remove uma empresa no Supabase."""
    supabase_service.delete_row(settings.supabase_empresas_table, empresa_id)
    return None
