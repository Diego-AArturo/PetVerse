from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import delete, insert, select, update

from src.db import SessionLocal
from src.deps.auth import get_current_user_from_bearer
from src.models import tables as t

router = APIRouter(prefix="/pets", tags=["pet-records"])


def _user_id(user) -> Optional[int]:
    if isinstance(user, dict):
        return user.get("id")
    return getattr(user, "id", None)


def _row_to_dict(row):
    try:
        return dict(row._mapping)
    except Exception:
        return dict(row)


def _list_by_pet(table, pet_id: int) -> List[dict]:
    session = SessionLocal()
    try:
        stmt = select(table).where(table.c.pet_id == pet_id)
        return [dict(r) for r in session.execute(stmt).mappings().all()]
    finally:
        session.close()


def _get_by_id(table, pet_id: int, item_id: int) -> Optional[dict]:
    session = SessionLocal()
    try:
        stmt = select(table).where(table.c.id == item_id, table.c.pet_id == pet_id)
        row = session.execute(stmt).mappings().first()
        return dict(row) if row else None
    finally:
        session.close()


def _create_for_pet(table, pet_id: int, data: dict) -> dict:
    session = SessionLocal()
    try:
        result = session.execute(insert(table).values(pet_id=pet_id, **data))
        session.commit()
        new_id = result.inserted_primary_key[0]
        return _get_by_id(table, pet_id, new_id)
    finally:
        session.close()


def _update_for_pet(table, pet_id: int, item_id: int, data: dict) -> Optional[dict]:
    if not data:
        return _get_by_id(table, pet_id, item_id)
    session = SessionLocal()
    try:
        stmt = update(table).where(table.c.id == item_id, table.c.pet_id == pet_id).values(**data)
        result = session.execute(stmt)
        session.commit()
        if result.rowcount == 0:
            return None
        return _get_by_id(table, pet_id, item_id)
    finally:
        session.close()


def _delete_for_pet(table, pet_id: int, item_id: int) -> bool:
    session = SessionLocal()
    try:
        stmt = delete(table).where(table.c.id == item_id, table.c.pet_id == pet_id)
        result = session.execute(stmt)
        session.commit()
        return result.rowcount > 0
    finally:
        session.close()


# ----- Schemas -----
class HealthRecordBase(BaseModel):
    record_date: Optional[date] = None
    description: Optional[str] = None
    vet_id: Optional[int] = None


class VaccineBase(BaseModel):
    vaccine_name: Optional[str] = None
    date: Optional[date] = None
    next_due: Optional[date] = None
    vet_clinic: Optional[str] = None
    notes: Optional[str] = None


class MedicationBase(BaseModel):
    medication: Optional[str] = None
    dose: Optional[str] = None
    frequency: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None


class WeightBase(BaseModel):
    date: Optional[date] = None
    weight: Optional[float] = None


class MediaBase(BaseModel):
    url: Optional[str] = None
    media_type: Optional[str] = None


class MedicalVisitBase(BaseModel):
    vet_id: Optional[int] = None
    visit_date: Optional[date] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    notes: Optional[str] = None


class VaccineCardScanBase(BaseModel):
    file_url: Optional[str] = None
    extracted_text: Optional[str] = None
    ocr_metadata: Optional[str] = None


# ----- Routes: health_records -----
@router.get("/{pet_id}/health-records")
async def list_health_records(pet_id: int, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)  # asegura autenticacion
    return _list_by_pet(t.health_records, pet_id)


@router.post("/{pet_id}/health-records", status_code=status.HTTP_201_CREATED)
async def create_health_record(pet_id: int, body: HealthRecordBase, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    return _create_for_pet(t.health_records, pet_id, body.dict(exclude_none=True))


@router.put("/{pet_id}/health-records/{record_id}")
async def update_health_record(pet_id: int, record_id: int, body: HealthRecordBase, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    updated = _update_for_pet(t.health_records, pet_id, record_id, body.dict(exclude_none=True))
    if not updated:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Registro no encontrado")
    return updated


@router.delete("/{pet_id}/health-records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_health_record(pet_id: int, record_id: int, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    if not _delete_for_pet(t.health_records, pet_id, record_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Registro no encontrado")


# ----- Routes: pet_vaccines -----
@router.get("/{pet_id}/vaccines")
async def list_vaccines(pet_id: int, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    return _list_by_pet(t.pet_vaccines, pet_id)


@router.post("/{pet_id}/vaccines", status_code=status.HTTP_201_CREATED)
async def create_vaccine(pet_id: int, body: VaccineBase, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    return _create_for_pet(t.pet_vaccines, pet_id, body.dict(exclude_none=True))


@router.put("/{pet_id}/vaccines/{vaccine_id}")
async def update_vaccine(pet_id: int, vaccine_id: int, body: VaccineBase, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    updated = _update_for_pet(t.pet_vaccines, pet_id, vaccine_id, body.dict(exclude_none=True))
    if not updated:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Vacuna no encontrada")
    return updated


@router.delete("/{pet_id}/vaccines/{vaccine_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vaccine(pet_id: int, vaccine_id: int, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    if not _delete_for_pet(t.pet_vaccines, pet_id, vaccine_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Vacuna no encontrada")


# ----- Routes: pet_medications -----
@router.get("/{pet_id}/medications")
async def list_medications(pet_id: int, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    return _list_by_pet(t.pet_medications, pet_id)


@router.post("/{pet_id}/medications", status_code=status.HTTP_201_CREATED)
async def create_medication(pet_id: int, body: MedicationBase, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    return _create_for_pet(t.pet_medications, pet_id, body.dict(exclude_none=True))


@router.put("/{pet_id}/medications/{med_id}")
async def update_medication(pet_id: int, med_id: int, body: MedicationBase, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    updated = _update_for_pet(t.pet_medications, pet_id, med_id, body.dict(exclude_none=True))
    if not updated:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Medicacion no encontrada")
    return updated


@router.delete("/{pet_id}/medications/{med_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medication(pet_id: int, med_id: int, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    if not _delete_for_pet(t.pet_medications, pet_id, med_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Medicacion no encontrada")


# ----- Routes: pet_weight_history -----
@router.get("/{pet_id}/weights")
async def list_weights(pet_id: int, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    return _list_by_pet(t.pet_weight_history, pet_id)


@router.post("/{pet_id}/weights", status_code=status.HTTP_201_CREATED)
async def create_weight(pet_id: int, body: WeightBase, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    return _create_for_pet(t.pet_weight_history, pet_id, body.dict(exclude_none=True))


@router.put("/{pet_id}/weights/{weight_id}")
async def update_weight(pet_id: int, weight_id: int, body: WeightBase, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    updated = _update_for_pet(t.pet_weight_history, pet_id, weight_id, body.dict(exclude_none=True))
    if not updated:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Registro de peso no encontrado")
    return updated


@router.delete("/{pet_id}/weights/{weight_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_weight(pet_id: int, weight_id: int, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    if not _delete_for_pet(t.pet_weight_history, pet_id, weight_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Registro de peso no encontrado")


# ----- Routes: pet_media -----
@router.get("/{pet_id}/media")
async def list_media(pet_id: int, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    return _list_by_pet(t.pet_media, pet_id)


@router.post("/{pet_id}/media", status_code=status.HTTP_201_CREATED)
async def create_media(pet_id: int, body: MediaBase, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    return _create_for_pet(t.pet_media, pet_id, body.dict(exclude_none=True))


@router.put("/{pet_id}/media/{media_id}")
async def update_media(pet_id: int, media_id: int, body: MediaBase, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    updated = _update_for_pet(t.pet_media, pet_id, media_id, body.dict(exclude_none=True))
    if not updated:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Media no encontrada")
    return updated


@router.delete("/{pet_id}/media/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(pet_id: int, media_id: int, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    if not _delete_for_pet(t.pet_media, pet_id, media_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Media no encontrada")


# ----- Routes: pet_medical_visits -----
@router.get("/{pet_id}/medical-visits")
async def list_medical_visits(pet_id: int, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    return _list_by_pet(t.pet_medical_visits, pet_id)


@router.post("/{pet_id}/medical-visits", status_code=status.HTTP_201_CREATED)
async def create_medical_visit(pet_id: int, body: MedicalVisitBase, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    return _create_for_pet(t.pet_medical_visits, pet_id, body.dict(exclude_none=True))


@router.put("/{pet_id}/medical-visits/{visit_id}")
async def update_medical_visit(pet_id: int, visit_id: int, body: MedicalVisitBase, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    updated = _update_for_pet(t.pet_medical_visits, pet_id, visit_id, body.dict(exclude_none=True))
    if not updated:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Visita no encontrada")
    return updated


@router.delete("/{pet_id}/medical-visits/{visit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medical_visit(pet_id: int, visit_id: int, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    if not _delete_for_pet(t.pet_medical_visits, pet_id, visit_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Visita no encontrada")


# ----- Routes: pet_vaccine_card_scans -----
@router.get("/{pet_id}/vaccine-scans")
async def list_vaccine_scans(pet_id: int, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    return _list_by_pet(t.pet_vaccine_card_scans, pet_id)


@router.post("/{pet_id}/vaccine-scans", status_code=status.HTTP_201_CREATED)
async def create_vaccine_scan(pet_id: int, body: VaccineCardScanBase, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    return _create_for_pet(t.pet_vaccine_card_scans, pet_id, body.dict(exclude_none=True))


@router.put("/{pet_id}/vaccine-scans/{scan_id}")
async def update_vaccine_scan(pet_id: int, scan_id: int, body: VaccineCardScanBase, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    updated = _update_for_pet(t.pet_vaccine_card_scans, pet_id, scan_id, body.dict(exclude_none=True))
    if not updated:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Escaneo no encontrado")
    return updated


@router.delete("/{pet_id}/vaccine-scans/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vaccine_scan(pet_id: int, scan_id: int, current_user=Depends(get_current_user_from_bearer)):
    _user_id(current_user)
    if not _delete_for_pet(t.pet_vaccine_card_scans, pet_id, scan_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Escaneo no encontrado")
