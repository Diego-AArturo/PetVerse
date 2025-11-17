from fastapi import APIRouter, Depends

from src.deps.auth import get_current_user_from_bearer
from src.db.pets import get_pets_by_owner

router = APIRouter(tags=["users"])


def _user_field(user, field):
    if isinstance(user, dict):
        return user.get(field)
    return getattr(user, field, None)


@router.get("/users/me", summary="Perfil del usuario autenticado")
async def get_my_profile(current_user=Depends(get_current_user_from_bearer)):
    owner_id = _user_field(current_user, "id")
    if not owner_id:
        return {"name": _user_field(current_user, "full_name"), "email": _user_field(current_user, "email"), "role": _user_field(current_user, "role"), "pets": []}
    pets = get_pets_by_owner(owner_id)
    pet_list = [
        {
            "id": pet.get("id"),
            "name": pet.get("name"),
            "species": pet.get("species"),
            "breed": pet.get("breed"),
            "avatar_url": pet.get("avatar_url"),
        }
        for pet in pets
    ]
    return {
        "name": _user_field(current_user, "full_name") or _user_field(current_user, "name"),
        "email": _user_field(current_user, "email"),
        "role": _user_field(current_user, "role"),
        "pets": pet_list,
    }
