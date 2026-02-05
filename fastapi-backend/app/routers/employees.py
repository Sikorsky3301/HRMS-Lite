from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db


router = APIRouter(prefix="/api/employees", tags=["employees"])


@router.get("/", response_model=List[schemas.EmployeeOut])
def list_employees(db: Session = Depends(get_db)):
  employees = (
      db.query(models.Employee)
      .order_by(models.Employee.created_at.desc())
      .all()
  )
  return employees


@router.post(
    "/", response_model=schemas.EmployeeOut, status_code=status.HTTP_201_CREATED
)
def create_employee(payload: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    employee = models.Employee(
        employee_id=payload.employee_id.strip(),
        full_name=payload.full_name.strip(),
        email=payload.email.strip().lower(),
        department=payload.department.strip(),
    )
    try:
        db.add(employee)
        db.commit()
        db.refresh(employee)
        return employee
    except IntegrityError as e:
        db.rollback()
        msg = str(e.orig)
        if "employees_employee_id_key" in msg or "employee_id" in msg:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An employee with this Employee ID already exists",
            )
        if "employees_email_key" in msg or "email" in msg:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An employee with this email already exists",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add employee",
        ) from e


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_employee(id: int, db: Session = Depends(get_db)):
    employee = db.get(models.Employee, id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found"
        )
    db.delete(employee)
    db.commit()
    return None

