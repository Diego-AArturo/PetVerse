from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from src.deps.auth import verify_google_token_and_get_user, create_access_token
from src.db.users import create_user_with_password, verify_user_credentials
from src.models.auth import GoogleTokenSchema, RegisterSchema, EmailLoginSchema
router = APIRouter()




def _public_user(user):
    if not user:
        return None
    if isinstance(user, dict):
        return {
            "id": user.get("id"),
            "name": user.get("full_name") or user.get("name"),
            "email": user.get("email"),
            "role": user.get("role") or user.get("user_type"),
        }
    return {
        "id": getattr(user, "id", None),
        "name": getattr(user, "full_name", None) or getattr(user, "name", None),
        "email": getattr(user, "email", None),
        "role": getattr(user, "role", None) or getattr(user, "user_type", None),
    }

@router.post("/google/callback")
async def google_callback(body: GoogleTokenSchema):
    """
    Verifica el id_token de Google, crea/obtiene usuario y devuelve JWT.
    """
    user = await verify_google_token_and_get_user(body.id_token)
    token = create_access_token({"sub": user.get("email") if isinstance(user, dict) else getattr(user, "email"), "role": user.get("role") if isinstance(user, dict) else getattr(user, "role")})
    return {"access_token": token, "token_type": "bearer", "user": _public_user(user)}


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(body: RegisterSchema):
    try:
        user = create_user_with_password(body.name, body.email, body.password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    token = create_access_token({"sub": body.email, "role": user.get("role") if isinstance(user, dict) else getattr(user, "role", None)})
    return {"access_token": token, "token_type": "bearer", "user": _public_user(user)}


@router.post("/login")
async def login_with_email(body: EmailLoginSchema):
    user = verify_user_credentials(body.email, body.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
    token = create_access_token({"sub": body.email, "role": user.get("role") if isinstance(user, dict) else getattr(user, "role", None)})
    return {"access_token": token, "token_type": "bearer", "user": _public_user(user)}
