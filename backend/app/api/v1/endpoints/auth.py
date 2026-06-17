import logging
import re
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field, field_validator

from app.core.config import settings
from app.schemas.usuario import UsuarioCreate, UsuarioRead
from app.services.supabase import supabase_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])

class LoginPayload(BaseModel):
    email: EmailStr
    password: str

def validate_telefone(value: str | None) -> str | None:
    """Valida e normaliza telefone brasileiro.
    Retorna None se vazio ou None, ou formata no padrão (XX) XXXXX-XXXX.
    """
    if not value:
        return None
    # Remove tudo que não é dígito
    digits = re.sub(r'\D', '', value)
    if not digits:
        return None
    if len(digits) not in (10, 11):
        raise ValueError('Telefone deve ter 10 ou 11 dígitos (DDD + número).')
    # Formata no padrão (XX) XXXXX-XXXX
    if len(digits) == 11:
        formatted = f'({digits[:2]}) {digits[2:7]}-{digits[7:]}'
    else:
        formatted = f'({digits[:2]}) {digits[2:6]}-{digits[6:]}'
    return formatted

def _validate_password(password: str) -> str:
    """Valida que a senha atende aos requisitos mínimos de segurança."""
    if len(password) < 8:
        raise ValueError('A senha deve ter no mínimo 8 caracteres.')
    if not re.search(r'[a-z]', password):
        raise ValueError('A senha deve conter pelo menos uma letra minúscula.')
    if not re.search(r'[A-Z]', password):
        raise ValueError('A senha deve conter pelo menos uma letra maiúscula.')
    if not re.search(r'[0-9]', password):
        raise ValueError('A senha deve conter pelo menos um número.')
    if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?`~]', password):
        raise ValueError('A senha deve conter pelo menos um caractere especial.')
    return password

class SignupPayload(BaseModel):
    """Schema para criação de usuário via signup."""
    nome: str = Field(min_length=1)
    sobrenome: str = Field(min_length=1)
    email: EmailStr
    telefone: str | None = None
    password: str = Field(min_length=8, max_length=255)
    tipo_usuario: str = Field(pattern="^(funcionario|empregador)$")
    idempresa: UUID | None = None
    pendente: bool = False

    @field_validator('password')
    @classmethod
    def password_strength(cls, v: str) -> str:
        return _validate_password(v)
    
class ForgotPasswordPayload(BaseModel):
    email: EmailStr
    redirectTo: str | None = None

class ResetPasswordPayload(BaseModel):
    email: str | None = None
    token: str
    new_password: str = Field(min_length=8, max_length=255)

    @field_validator('new_password')
    @classmethod
    def new_password_strength(cls, v: str) -> str:
        return _validate_password(v)

@router.post("/login")
def login(payload: LoginPayload):
    """
    Realiza o login de um utilizador via e-mail e palavra-passe.
    Retorna o token de acesso gerado pelo Supabase.
    """
    session_data = supabase_service.login_user(payload.email, payload.password)
    return session_data

@router.post("/signup", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupPayload) -> UsuarioRead:
    """
    Registra um novo usuário no Supabase Auth e cria um registro na tabela de usuários.

    Args:
        payload: Dados para criação do usuário (nome, sobrenome, email, telefone, senha, tipo).

    Returns:
        UsuarioRead: Usuário criado com `id` e `criado_em`.
        
    Raises:
        HTTPException: Quando há erro na autenticação ou na criação do usuário.
    """
    try:
        # Limpeza e normalização dos dados
        email_limpo = payload.email.strip().lower()
        senha_limpa = payload.password.strip()
        
        logger.info(f"Iniciando signup para email: {email_limpo}")
        
        # Verificar se o email já está cadastrado na tabela de usuários
        logger.info("Verificando se o email já existe na tabela de usuários...")
        usuario_existente = supabase_service.get_user_by_email(
            settings.supabase_usuarios_table, email_limpo
        )
        if usuario_existente:
            logger.warning(f"Tentativa de cadastro com email já existente: {email_limpo}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Este email já está cadastrado. Use outro email ou faça login."
            )
        
        # Primeiro, criar o usuário no Supabase Auth
        logger.info("Criando usuário no Supabase Auth...")
        auth_user = supabase_service.signup_user(email_limpo, senha_limpa)
        logger.info(f"Usuário Auth criado com sucesso: {auth_user}")
        
        # Validação e normalização do telefone
        telefone_normalizado = validate_telefone(payload.telefone)

        # Depois, criar o registro na tabela de usuários
        logger.info("Criando registro na tabela de usuários...")
        auth_user_payload = auth_user.get("user") or {}
        auth_user_id = auth_user_payload.get("id")
        usuario_data = UsuarioCreate(
            id=auth_user_id,
            nome=payload.nome,
            sobrenome=payload.sobrenome,
            email=email_limpo,
            telefone=telefone_normalizado,
            tipo_usuario=payload.tipo_usuario,
            idempresa=payload.idempresa,
            pendente=payload.pendente,
        )
        
        usuario = supabase_service.create_row(
            settings.supabase_usuarios_table,
            usuario_data.model_dump(mode="json", exclude_none=True),
        )
        logger.info(f"Usuário criado com sucesso na tabela: {usuario}")
        
        return UsuarioRead.model_validate(usuario)
    except HTTPException as e:
        logger.error(f"HTTPException no signup: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Erro inesperado no signup: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao criar usuário. Tente novamente mais tarde."
        )

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordPayload):
    """
    Solicita a recuperação de senha enviando um e-mail com código/link.
    """
    return supabase_service.recover_password(payload.email, payload.redirectTo)

@router.post("/reset-password")
def reset_password(payload: ResetPasswordPayload):
    """
    Redefine a senha do usuário utilizando o código ou token recebido por e-mail.
    """
    # 1. Verificar o código OTP e obter uma sessão
    logger.info(f"Verificando código/token para email: {payload.email}")
    session = supabase_service.verify_otp(payload.email, payload.token, type="recovery")
    
    access_token = session.get("access_token")
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não foi possível validar o código de recuperação."
        )
    
    # 2. Atualizar a senha no Supabase Auth usando o access_token
    return supabase_service.update_user_password(access_token, payload.new_password)
