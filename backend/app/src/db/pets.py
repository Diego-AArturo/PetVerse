from typing import Dict, Any, List

try:
    from src.db import SessionLocal
    from src.models.tables import pets as pets_table
    from sqlalchemy import select, insert, update, delete
    DB_AVAILABLE = True
except Exception:
    DB_AVAILABLE = False

_in_memory_store: Dict[int, Dict[str, Any]] = {}
_in_memory_counter = 1

_PET_FIELDS = {"name", "species", "breed", "sex", "birthdate", "weight", "avatar_url"}


def _row_to_dict(row) -> Dict[str, Any]:
    try:
        return dict(row._mapping)
    except Exception:
        try:
            return {c.name: getattr(row, c.name) for c in row.__table__.columns}
        except Exception:
            return dict(row)


def _sanitize_pet_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    data = {}
    for key, value in payload.items():
        if key in _PET_FIELDS and value is not None:
            data[key] = value
    return data


def get_pets_by_owner(owner_id: int) -> List[Dict[str, Any]]:
    if DB_AVAILABLE:
        session = SessionLocal()
        try:
            stmt = select(pets_table).where(pets_table.c.owner_id == owner_id)
            result = session.execute(stmt).mappings().all()
            return [dict(r) for r in result]
        finally:
            session.close()
    return [pet for pet in _in_memory_store.values() if pet["owner_id"] == owner_id]


def get_pet_by_id(pet_id: int) -> Dict[str, Any]:
    if DB_AVAILABLE:
        session = SessionLocal()
        try:
            stmt = select(pets_table).where(pets_table.c.id == pet_id)
            row = session.execute(stmt).mappings().first()
            return dict(row) if row else None
        finally:
            session.close()
    return _in_memory_store.get(pet_id)


def create_pet(owner_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    data = _sanitize_pet_payload(payload)
    data["owner_id"] = owner_id
    if DB_AVAILABLE:
        session = SessionLocal()
        try:
            stmt = insert(pets_table).values(**data)
            result = session.execute(stmt)
            session.commit()
            pet_id = result.inserted_primary_key[0]
            return get_pet_by_id(pet_id)
        finally:
            session.close()
    global _in_memory_counter
    pet = data.copy()
    pet["id"] = _in_memory_counter
    _in_memory_store[_in_memory_counter] = pet
    _in_memory_counter += 1
    return pet


def update_pet(owner_id: int, pet_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    data = _sanitize_pet_payload(payload)
    if not data:
        return get_pet_by_id(pet_id)
    if DB_AVAILABLE:
        session = SessionLocal()
        try:
            stmt = select(pets_table).where(pets_table.c.id == pet_id, pets_table.c.owner_id == owner_id)
            existing = session.execute(stmt).mappings().first()
            if not existing:
                return None
            upd = update(pets_table).where(pets_table.c.id == pet_id).values(**data)
            session.execute(upd)
            session.commit()
            return get_pet_by_id(pet_id)
        finally:
            session.close()
    pet = _in_memory_store.get(pet_id)
    if not pet or pet["owner_id"] != owner_id:
        return None
    pet.update(data)
    return pet


def delete_pet(owner_id: int, pet_id: int) -> bool:
    if DB_AVAILABLE:
        session = SessionLocal()
        try:
            stmt = delete(pets_table).where(pets_table.c.id == pet_id, pets_table.c.owner_id == owner_id)
            result = session.execute(stmt)
            session.commit()
            return result.rowcount > 0
        finally:
            session.close()
    pet = _in_memory_store.get(pet_id)
    if not pet or pet["owner_id"] != owner_id:
        return False
    del _in_memory_store[pet_id]
    return True
