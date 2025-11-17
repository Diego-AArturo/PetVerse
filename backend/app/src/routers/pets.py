import shutil
import time
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, status, UploadFile
from pydantic import BaseModel, Field

from src.deps.auth import get_current_user_from_bearer
from src.db.pets import (
    create_pet as db_create_pet,
    delete_pet as db_delete_pet,
    get_pet_by_id,
    get_pets_by_owner,
    update_pet as db_update_pet,
)

MEDIA_ROOT = Path("media/pets")
MEDIA_ROOT.mkdir(parents=True, exist_ok=True)

router = APIRouter(tags=["pets"])


class PetBase(BaseModel):
    name: str = Field(..., min_length=1)
    species: str = Field(..., min_length=1)
    breed: Optional[str] = None
    sex: Optional[str] = None
    birthdate: Optional[str] = None
    weight: Optional[float] = None
    avatar_url: Optional[str] = None


class PetCreate(PetBase):
    pass


class PetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    species: Optional[str] = Field(None, min_length=1)
    breed: Optional[str] = None
    sex: Optional[str] = None
    birthdate: Optional[str] = None
    weight: Optional[float] = None
    avatar_url: Optional[str] = None


class PetResponse(PetBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True


def _owner_id(user) -> Optional[int]:
    if isinstance(user, dict):
        return user.get("id")
    return getattr(user, "id", None)


@router.get("/pets", response_model=List[PetResponse])
async def list_pets(current_user=Depends(get_current_user_from_bearer)):
    owner_id = _owner_id(current_user)
    if not owner_id:
        return []
    pets = get_pets_by_owner(owner_id)
    return [PetResponse(**pet) for pet in pets]


@router.post("/pets", status_code=status.HTTP_201_CREATED, response_model=PetResponse)
async def create_new_pet(pet: PetCreate, current_user=Depends(get_current_user_from_bearer)):
    owner_id = _owner_id(current_user)
    if not owner_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario inválido")
    new_pet = db_create_pet(owner_id, pet.dict(exclude_none=True))
    if not new_pet:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se pudo crear la mascota")
    return PetResponse(**new_pet)


@router.put("/pets/{pet_id}", response_model=PetResponse)
async def update_existing_pet(pet_id: int, pet: PetUpdate, current_user=Depends(get_current_user_from_bearer)):
    owner_id = _owner_id(current_user)
    if not owner_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario inválido")
    updated = db_update_pet(owner_id, pet_id, pet.dict(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mascota no encontrada o sin permisos")
    return PetResponse(**updated)


@router.delete("/pets/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_pet(pet_id: int, current_user=Depends(get_current_user_from_bearer)):
    owner_id = _owner_id(current_user)
    if not owner_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario inválido")
    success = db_delete_pet(owner_id, pet_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mascota no encontrada o sin permisos")


@router.post("/pets/upload-image", summary="Sube la imagen del perfil de una mascota")
async def upload_pet_image(pet_id: int, file: UploadFile = File(...), current_user=Depends(get_current_user_from_bearer)):
    owner_id = _owner_id(current_user)
    if not owner_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario inválido")
    pet = get_pet_by_id(pet_id)
    if not pet or pet.get("owner_id") != owner_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mascota no encontrada o sin permisos")
    safe_name = Path(file.filename).name
    timestamp = int(time.time())
    filename = f"{pet_id}_{timestamp}_{safe_name}"
    path = MEDIA_ROOT / filename
    with path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    avatar_url = f"/media/pets/{filename}"
    db_update_pet(owner_id, pet_id, {"avatar_url": avatar_url})
    return {"avatar_url": avatar_url}
