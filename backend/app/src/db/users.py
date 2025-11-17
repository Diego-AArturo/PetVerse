"""
CRUD simple para usuarios. Intenta usar SessionLocal desde src.db si existe,
si no, usa almacenamiento en memoria (útil para desarrollo rápido).
Adapta a tu configuración real de DB si tu módulo src.db expone nombres distintos.
"""
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
        u = {"id": _in_memory_id, "email": email, "name": name, "role": role}
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
