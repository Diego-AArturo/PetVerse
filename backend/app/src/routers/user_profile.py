from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import insert, select, update

from src.db import SessionLocal
from src.deps.auth import get_current_user_from_bearer
from src.models import tables as t

router = APIRouter(tags=["user-settings"])


def _user_id(user) -> Optional[int]:
    if isinstance(user, dict):
        return user.get("id")
    return getattr(user, "id", None)


def _row_to_dict(row):
    try:
        return dict(row._mapping)
    except Exception:
        return dict(row)


def _get_by_user(table, user_id: int):
    session = SessionLocal()
    try:
        stmt = select(table).where(table.c.user_id == user_id)
        row = session.execute(stmt).mappings().first()
        return dict(row) if row else None
    finally:
        session.close()


def _upsert(table, user_id: int, data: dict):
    session = SessionLocal()
    try:
        stmt = select(table).where(table.c.user_id == user_id)
        existing = session.execute(stmt).mappings().first()
        if existing:
            session.execute(update(table).where(table.c.id == existing["id"]).values(**data))
            session.commit()
            return _get_by_user(table, user_id)
        result = session.execute(insert(table).values(user_id=user_id, **data))
        session.commit()
        new_id = result.inserted_primary_key[0]
        return _get_by_user(table, user_id)
    finally:
        session.close()


class UserSettingsSchema(BaseModel):
    notifications_enabled: Optional[bool] = None
    privacy_level: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None


class UserAddressSchema(BaseModel):
    country: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


@router.get("/users/me/settings")
async def get_my_settings(current_user=Depends(get_current_user_from_bearer)):
    user_id = _user_id(current_user)
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Usuario no autenticado")
    return _get_by_user(t.user_settings, user_id) or {}


@router.put("/users/me/settings")
async def update_my_settings(body: UserSettingsSchema, current_user=Depends(get_current_user_from_bearer)):
    user_id = _user_id(current_user)
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Usuario no autenticado")
    return _upsert(t.user_settings, user_id, body.dict(exclude_none=True))


@router.get("/users/me/address")
async def get_my_address(current_user=Depends(get_current_user_from_bearer)):
    user_id = _user_id(current_user)
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Usuario no autenticado")
    return _get_by_user(t.user_address, user_id) or {}


@router.put("/users/me/address")
async def update_my_address(body: UserAddressSchema, current_user=Depends(get_current_user_from_bearer)):
    user_id = _user_id(current_user)
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Usuario no autenticado")
    return _upsert(t.user_address, user_id, body.dict(exclude_none=True))
