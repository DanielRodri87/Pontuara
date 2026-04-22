from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.services.supabase import supabase_service

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginPayload(BaseModel):
    email: EmailStr
    password: str

@router.post("/login")
def login(payload: LoginPayload):
    """
    Realiza o login de um utilizador via e-mail e palavra-passe.
    Retorna o token de acesso gerado pelo Supabase.
    """
    session_data = supabase_service.login_user(payload.email, payload.password)
    return session_data