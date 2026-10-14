from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, model_validator
import re


class TransactionCreate(BaseModel):
    description: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Human-readable description of the transaction.",
        examples=["Uber to airport"],
    )
    amount: float = Field(
        ...,
        gt=0,
        le=1_000_000_000,
        description="Positive monetary amount (service layer applies sign).",
        examples=[450.50],
    )
    transaction_type: str = Field(
        ...,
        description="Must be 'income' or 'expense' (case-insensitive).",
        examples=["expense"],
    )
    category: Optional[str] = Field(
        None,
        max_length=50,
        description="Optional override category. Skips auto-categorization.",
        examples=["Transport"],
    )

    @field_validator("description")
    @classmethod
    def description_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("description must not be blank")
        return v.strip()

    @field_validator("amount")
    @classmethod
    def round_amount(cls, v: float) -> float:
        rounded = round(v, 2)
        return rounded

    @field_validator("transaction_type")
    @classmethod
    def normalize_type(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in ("income", "expense"):
            raise ValueError("transaction_type must be 'income' or 'expense'")
        return v

    @field_validator("category")
    @classmethod
    def validate_category_field(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("category must not be blank if provided")
            if len(v) > 50:
                raise ValueError("category must be 50 characters or fewer")
        return v


class TransactionResponse(BaseModel):
    id: int
    description: str
    amount: float = Field(description="Absolute value of the transaction amount.")
    transaction_type: str
    category: Optional[str]
    auto_tagged: bool
    timestamp: datetime

    model_config = {"from_attributes": True}


class ReclassifyRequest(BaseModel):
    category: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="New category to assign to the transaction.",
        examples=["Travel"],
    )

    @field_validator("category")
    @classmethod
    def category_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("category must not be blank")
        return v.strip()


class CategorySummary(BaseModel):
    category: str
    transaction_type: str
    total: float
    count: int


class SummaryResponse(BaseModel):
    month: str = Field(description="Month in YYYY-MM format.", examples=["2026-10"])
    total_income: float
    total_expense: float
    net: float
    categories: list[CategorySummary]
