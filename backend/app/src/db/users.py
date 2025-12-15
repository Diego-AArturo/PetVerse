"""
CRUD simple para usuarios. Intenta usar SessionLocal desde src.db si existe,
si no, usa almacenamiento en memoria (útil para desarrollo rápido).
Adapta a tu configuración real de DB si tu módulo src.db expone nombres distintos.
"""
from datetime import datetime
import hashlib

try:
    from src.db import SessionLocal
    from src.models.tables import users as users_table
    from src.models.tables import metadata
    from sqlalchemy import select
    DB_AVAILABLE = True
except Exception:
    DB_AVAILABLE = False

# caída a memoria si no hay DB configurada
_in_memory_store = {}
_in_memory_id = 1


def _now():
    return datetime.utcnow()


def _hash_password(password: str) -> str:
    if password is None:
        return ""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def _row_to_dict(row):
    try:
        return {c.name: getattr(row, c.name) for c in row.__table__.columns}
    except Exception:
        # si es resultado de select() -> Row
        try:
            return dict(row._mapping)
        except Exception:
            return row


def get_or_create_user(email: str, name: str, role: str = "tutor"):
    global _in_memory_id
    if DB_AVAILABLE:
        session = SessionLocal()
        try:
            q = select(users_table).where(users_table.c.email == email)
            r = session.execute(q).mappings().first()
            if r:
                return dict(r)
            ins = users_table.insert().values(full_name=name, email=email, user_type=role)
            result = session.execute(ins)
            session.commit()
            q2 = select(users_table).where(users_table.c.email == email)
            r2 = session.execute(q2).mappings().first()
            return dict(r2) if r2 else None
        finally:
            session.close()
    else:
        u = _in_memory_store.get(email)
        if u:
            return u
        u = {
            "id": _in_memory_id,
            "email": email,
            "name": name,
            "full_name": name,
            "role": role,
            "password_hash": None,
            "created_at": _now(),
            "updated_at": _now(),
        }
        _in_memory_store[email] = u
        _in_memory_id += 1
        return u


def get_user_by_email(email: str):
    if DB_AVAILABLE:
        session = SessionLocal()
        try:
            q = select(users_table).where(users_table.c.email == email)
            r = session.execute(q).mappings().first()
            return dict(r) if r else None
        finally:
            session.close()
    else:
        return _in_memory_store.get(email)


def create_user_with_password(full_name: str, email: str, password: str, role: str = "tutor"):
    hashed = _hash_password(password)
    if DB_AVAILABLE:
        session = SessionLocal()
        try:
            q = select(users_table).where(users_table.c.email == email)
            existing = session.execute(q).mappings().first()
            if existing:
                raise ValueError("El email ya está registrado")
            ins = users_table.insert().values(
                full_name=full_name,
                email=email,
                password_hash=hashed,
                user_type=role,
                created_at=_now(),
                updated_at=_now(),
            )
            session.execute(ins)
            session.commit()
            return get_user_by_email(email)
        finally:
            session.close()
    else:
        if email in _in_memory_store:
            raise ValueError("El email ya está registrado")
        global _in_memory_id
        user = {
            "id": _in_memory_id,
            "email": email,
            "name": full_name,
            "full_name": full_name,
            "password_hash": hashed,
            "role": role,
            "created_at": _now(),
            "updated_at": _now(),
        }
        _in_memory_store[email] = user
        _in_memory_id += 1
        return user


def verify_user_credentials(email: str, password: str):
    user = get_user_by_email(email)
    if not user:
        return None
    stored_hash = user.get("password_hash")
    if not stored_hash:
        return None
    return user if stored_hash == _hash_password(password) else None
