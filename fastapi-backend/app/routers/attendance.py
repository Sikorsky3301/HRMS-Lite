from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..db import get_db


router = APIRouter(prefix="/api/attendance", tags=["attendance"])


@router.get("/", response_model=List[schemas.AttendanceOut])
def list_attendance(
    employee_id: Optional[str] = Query(default=None),
    date: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    q = (
        db.query(models.Attendance, models.Employee.full_name)
        .join(models.Employee, models.Attendance.employee_id == models.Employee.employee_id, isouter=True)
    )

    if employee_id:
        q = q.filter(models.Attendance.employee_id == employee_id)
    if date:
        q = q.filter(models.Attendance.date == date)

    q = q.order_by(models.Attendance.date.desc(), models.Attendance.created_at.desc())

    rows = q.all()
    result: List[schemas.AttendanceOut] = []
    for attendance, full_name in rows:
        result.append(
            schemas.AttendanceOut.from_orm(attendance).copy(
                update={"full_name": full_name}
            )
        )
    return result


@router.get(
    "/employee/{employee_id}",
    response_model=List[schemas.AttendanceOut],
)
def attendance_by_employee(
    employee_id: str,
    date: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    q = (
        db.query(models.Attendance, models.Employee.full_name)
        .join(models.Employee, models.Attendance.employee_id == models.Employee.employee_id, isouter=True)
        .filter(models.Attendance.employee_id == employee_id)
        .order_by(models.Attendance.date.desc())
    )
    if date:
        q = q.filter(models.Attendance.date == date)

    rows = q.all()
    result: List[schemas.AttendanceOut] = []
    for attendance, full_name in rows:
        result.append(
            schemas.AttendanceOut.from_orm(attendance).copy(
                update={"full_name": full_name}
            )
        )
    return result


@router.get("/stats/{employee_id}", response_model=schemas.AttendanceStats)
def attendance_stats(employee_id: str, db: Session = Depends(get_db)):
    total_days, present_days, absent_days = db.query(
        func.count(models.Attendance.id),
        func.sum(func.case((models.Attendance.status == "Present", 1), else_=0)),
        func.sum(func.case((models.Attendance.status == "Absent", 1), else_=0)),
    ).filter(models.Attendance.employee_id == employee_id).one()

    return schemas.AttendanceStats(
        total_days=int(total_days or 0),
        present_days=int(present_days or 0),
        absent_days=int(absent_days or 0),
    )


@router.post(
    "/",
    response_model=schemas.AttendanceOut,
    status_code=status.HTTP_201_CREATED,
)
def mark_attendance(
    payload: schemas.AttendanceCreate,
    db: Session = Depends(get_db),
):
    # ensure employee exists
    employee = (
        db.query(models.Employee)
        .filter(models.Employee.employee_id == payload.employee_id)
        .first()
    )
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found"
        )

    # upsert on (employee_id, date)
    record = (
        db.query(models.Attendance)
        .filter(
            models.Attendance.employee_id == payload.employee_id,
            models.Attendance.date == payload.date,
        )
        .first()
    )

    if record:
        record.status = payload.status
    else:
        record = models.Attendance(
            employee_id=payload.employee_id,
            date=payload.date,
            status=payload.status,
        )
        db.add(record)

    try:
        db.commit()
        db.refresh(record)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark attendance",
        ) from e

    # load full_name
    db.refresh(employee)
    return schemas.AttendanceOut.from_orm(record).copy(
        update={"full_name": employee.full_name}
    )

