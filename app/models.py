from datetime import datetime
from sqlalchemy import Integer, String, Float, Boolean, DateTime, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        CheckConstraint(
            "transaction_type IN ('income', 'expense')",
            name="ck_transaction_type",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    transaction_type: Mapped[str] = mapped_column(String(10), nullable=False)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    auto_tagged: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )
