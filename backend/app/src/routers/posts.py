from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import delete, insert, select, update

from src.db import SessionLocal
from src.deps.auth import get_current_user_from_bearer
from src.models import tables as t

router = APIRouter(tags=["posts"])


def _user_id(user) -> Optional[int]:
    if isinstance(user, dict):
        return user.get("id")
    return getattr(user, "id", None)


def _row_to_dict(row):
    try:
        return dict(row._mapping)
    except Exception:
        return dict(row)


def _get_post(post_id: int):
    session = SessionLocal()
    try:
        stmt = select(t.posts).where(t.posts.c.id == post_id)
        row = session.execute(stmt).mappings().first()
        return dict(row) if row else None
    finally:
        session.close()


def _list_posts(pet_id: Optional[int] = None) -> List[dict]:
    session = SessionLocal()
    try:
        stmt = select(t.posts)
        if pet_id is not None:
            stmt = stmt.where(t.posts.c.pet_id == pet_id)
        return [dict(r) for r in session.execute(stmt).mappings().all()]
    finally:
        session.close()


class PostSchema(BaseModel):
    pet_id: Optional[int] = None
    content: Optional[str] = None
    media_urls: Optional[str] = None
    visibility: Optional[str] = None


class CommentSchema(BaseModel):
    comment: str


@router.get("/posts")
async def list_posts(pet_id: Optional[int] = None):
    return _list_posts(pet_id)


@router.post("/posts", status_code=status.HTTP_201_CREATED)
async def create_post(body: PostSchema, current_user=Depends(get_current_user_from_bearer)):
    user_id = _user_id(current_user)
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Usuario no autenticado")
    data = body.dict(exclude_none=True)
    data.update({"user_id": user_id, "created_at": datetime.utcnow()})
    session = SessionLocal()
    try:
        result = session.execute(insert(t.posts).values(**data))
        session.commit()
        return _get_post(result.inserted_primary_key[0])
    finally:
        session.close()


@router.get("/posts/{post_id}")
async def get_post(post_id: int):
    post = _get_post(post_id)
    if not post:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Post no encontrado")
    return post


@router.put("/posts/{post_id}")
async def update_post(post_id: int, body: PostSchema, current_user=Depends(get_current_user_from_bearer)):
    user_id = _user_id(current_user)
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Usuario no autenticado")
    post = _get_post(post_id)
    if not post or post.get("user_id") != user_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Post no encontrado o sin permiso")
    data = body.dict(exclude_none=True)
    if not data:
        return post
    session = SessionLocal()
    try:
        session.execute(update(t.posts).where(t.posts.c.id == post_id).values(**data))
        session.commit()
        return _get_post(post_id)
    finally:
        session.close()


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: int, current_user=Depends(get_current_user_from_bearer)):
    user_id = _user_id(current_user)
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Usuario no autenticado")
    post = _get_post(post_id)
    if not post or post.get("user_id") != user_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Post no encontrado o sin permiso")
    session = SessionLocal()
    try:
        session.execute(delete(t.posts).where(t.posts.c.id == post_id))
        session.commit()
    finally:
        session.close()


# ----- Likes -----
@router.get("/posts/{post_id}/likes")
async def list_likes(post_id: int):
    session = SessionLocal()
    try:
        stmt = select(t.post_likes).where(t.post_likes.c.post_id == post_id)
        return [dict(r) for r in session.execute(stmt).mappings().all()]
    finally:
        session.close()


@router.post("/posts/{post_id}/likes", status_code=status.HTTP_201_CREATED)
async def like_post(post_id: int, current_user=Depends(get_current_user_from_bearer)):
    user_id = _user_id(current_user)
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Usuario no autenticado")
    # evita duplicados sencillos
    session = SessionLocal()
    try:
        exists_stmt = select(t.post_likes).where(
            t.post_likes.c.post_id == post_id, t.post_likes.c.user_id == user_id
        )
        if session.execute(exists_stmt).first():
            return {"detail": "Like ya existe"}
        result = session.execute(insert(t.post_likes).values(post_id=post_id, user_id=user_id))
        session.commit()
        return {"id": result.inserted_primary_key[0], "post_id": post_id, "user_id": user_id}
    finally:
        session.close()


@router.delete("/posts/{post_id}/likes", status_code=status.HTTP_204_NO_CONTENT)
async def unlike_post(post_id: int, current_user=Depends(get_current_user_from_bearer)):
    user_id = _user_id(current_user)
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Usuario no autenticado")
    session = SessionLocal()
    try:
        stmt = delete(t.post_likes).where(
            t.post_likes.c.post_id == post_id, t.post_likes.c.user_id == user_id
        )
        session.execute(stmt)
        session.commit()
    finally:
        session.close()


# ----- Comments -----
@router.get("/posts/{post_id}/comments")
async def list_comments(post_id: int):
    session = SessionLocal()
    try:
        stmt = select(t.post_comments).where(t.post_comments.c.post_id == post_id)
        return [dict(r) for r in session.execute(stmt).mappings().all()]
    finally:
        session.close()


@router.post("/posts/{post_id}/comments", status_code=status.HTTP_201_CREATED)
async def create_comment(post_id: int, body: CommentSchema, current_user=Depends(get_current_user_from_bearer)):
    user_id = _user_id(current_user)
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Usuario no autenticado")
    session = SessionLocal()
    try:
        result = session.execute(
            insert(t.post_comments).values(
                post_id=post_id,
                user_id=user_id,
                comment=body.comment,
                created_at=datetime.utcnow(),
            )
        )
        session.commit()
        comment_id = result.inserted_primary_key[0]
        stmt = select(t.post_comments).where(t.post_comments.c.id == comment_id)
        row = session.execute(stmt).mappings().first()
        return dict(row) if row else {"id": comment_id}
    finally:
        session.close()


@router.delete("/posts/{post_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(post_id: int, comment_id: int, current_user=Depends(get_current_user_from_bearer)):
    user_id = _user_id(current_user)
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Usuario no autenticado")
    session = SessionLocal()
    try:
        stmt = select(t.post_comments).where(t.post_comments.c.id == comment_id)
        row = session.execute(stmt).mappings().first()
        if not row or row.get("user_id") != user_id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Comentario no encontrado o sin permiso")
        session.execute(delete(t.post_comments).where(t.post_comments.c.id == comment_id))
        session.commit()
    finally:
        session.close()
