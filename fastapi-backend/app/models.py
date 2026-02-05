from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    Integer,
    String,
    Text,
    UniqueConstraint,
    ForeignKey,
)
from sqlalchemy.orm import relationship, Mapped

from .db import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    employee_id: Mapped[str] = Column(String, unique=True, nullable=False, index=True)
    full_name: Mapped[str] = Column(String, nullable=False)
    email: Mapped[str] = Column(String, unique=True, nullable=False, index=True)
    department: Mapped[str] = Column(String, nullable=False)
    created_at: Mapped[datetime] = Column(
        DateTime, nullable=False, default=datetime.utcnow
    )

    attendance_records: Mapped[list["Attendance"]] = relationship(
        "Attendance", back_populates="employee", cascade="all, delete-orphan"
    )


class Attendance(Base):
    __tablename__ = "attendance"

    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    employee_id: Mapped[str] = Column(
        String, ForeignKey("employees.employee_id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[str] = Column(String, nullable=False)  # stored as YYYY-MM-DD text
    status: Mapped[str] = Column(String, nullable=False)
    created_at: Mapped[datetime] = Column(
        DateTime, nullable=False, default=datetime.utcnow
    )

    __table_args__ = (
        UniqueConstraint("employee_id", "date", name="uq_attendance_employee_date"),
        CheckConstraint(
            "status IN ('Present', 'Absent')", name="ck_attendance_status"
        ),
    )

    employee: Mapped[Employee] = relationship(
        "Employee", back_populates="attendance_records"
    )

