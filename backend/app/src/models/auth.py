from pydantic import BaseModel, EmailStr, Field

class GoogleTokenSchema(BaseModel):
    id_token: str

class RegisterSchema(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)

class EmailLoginSchema(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)