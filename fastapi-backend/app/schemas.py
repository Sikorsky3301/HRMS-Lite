from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class EmployeeBase(BaseModel):
    employee_id: str = Field(..., examples=["EMP001"])
    full_name: str = Field(..., examples=["John Doe"])
    email: EmailStr
    department: str = Field(..., examples=["Engineering"])


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeOut(EmployeeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class AttendanceBase(BaseModel):
    employee_id: str
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    status: str = Field(..., pattern=r"^(Present|Absent)$")


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceOut(AttendanceBase):
    id: int
    full_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AttendanceStats(BaseModel):
    total_days: int
    present_days: int
    absent_days: int

