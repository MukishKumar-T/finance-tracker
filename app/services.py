"""
Business logic layer.

Sign convention:
  - Expenses stored as negative amounts in the DB.
  - Income stored as positive amounts.
  - All responses and summaries expose absolute values.
"""

import re
import logging
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Transaction
from app.schemas import TransactionCreate
from app.categorizer import categorize, validate_category_type
from app.exceptions import DuplicateTransactionError, CategoryTypeMismatchError

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _normalize_description(text: str) -> str:
    """Trim, lowercase, collapse whitespace, strip apostrophes."""
    text = text.lower().strip()
    text = re.sub(r"['\u2019\u2018]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text


def _to_signed(amount: float, transaction_type: str) -> float:
    """Convert absolute amount to signed based on type."""
    abs_amount = abs(amount)
    return -abs_amount if transaction_type == "expense" else abs_amount


def _to_absolute(amount: float) -> float:
    return abs(amount)


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------

def create_transaction(db: Session, data: TransactionCreate) -> Transaction:
    # Resolve category
    if data.category:
        category = data.category
        auto_tagged = False
    else:
        category = categorize(data.description)
        auto_tagged = True

    # R3: type/category consistency
    if not validate_category_type(category, data.transaction_type):
        raise CategoryTypeMismatchError(category, data.transaction_type)

    # R4: duplicate detection
    now = datetime.utcnow()
    window = timedelta(minutes=settings.duplicate_window_minutes)
    norm_desc = _normalize_description(data.description)
    rounded_amount = round(abs(data.amount), 2)

    existing = (
        db.query(Transaction)
        .filter(
            Transaction.transaction_type == data.transaction_type,
            Transaction.timestamp >= now - window,
            Transaction.timestamp <= now + window,
        )
        .all()
    )

    for t in existing:
        if (
            round(abs(t.amount), 2) == rounded_amount
            and _normalize_description(t.description) == norm_desc
        ):
            raise DuplicateTransactionError(t.id)

    signed_amount = _to_signed(data.amount, data.transaction_type)

    transaction = Transaction(
        description=data.description.strip(),
        amount=signed_amount,
        transaction_type=data.transaction_type,
        category=category,
        auto_tagged=auto_tagged,
        timestamp=now,
    )

    try:
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
    except Exception:
        db.rollback()
        logger.exception("Failed to create transaction")
        raise

    # Return with absolute amount for serialisation
    transaction.amount = _to_absolute(transaction.amount)
    return transaction


# ---------------------------------------------------------------------------
# List / filter
# ---------------------------------------------------------------------------

def list_transactions(
    db: Session,
    month: Optional[str] = None,
    transaction_type: Optional[str] = None,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> list[Transaction]:
    q = db.query(Transaction)

    if month:
        year, mon = int(month[:4]), int(month[5:7])
        q = q.filter(
            extract("year", Transaction.timestamp) == year,
            extract("month", Transaction.timestamp) == mon,
        )

    if transaction_type:
        q = q.filter(Transaction.transaction_type == transaction_type)

    if category:
        q = q.filter(Transaction.category == category)

    transactions = (
        q.order_by(Transaction.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    for t in transactions:
        t.amount = _to_absolute(t.amount)

    return transactions


# ---------------------------------------------------------------------------
# Delete
# ---------------------------------------------------------------------------

def delete_transaction(db: Session, transaction_id: int) -> None:
    t = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if t is None:
        return None  # caller raises 404

    try:
        db.delete(t)
        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Failed to delete transaction %s", transaction_id)
        raise

    return t  # signals success


# ---------------------------------------------------------------------------
# Reclassify
# ---------------------------------------------------------------------------

def reclassify_transaction(
    db: Session, transaction_id: int, category: str
) -> Transaction:
    t = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if t is None:
        return None  # caller raises 404

    # R3: validate type/category consistency
    if not validate_category_type(category, t.transaction_type):
        raise CategoryTypeMismatchError(category, t.transaction_type)

    t.category = category
    t.auto_tagged = False

    try:
        db.commit()
        db.refresh(t)
    except Exception:
        db.rollback()
        logger.exception("Failed to reclassify transaction %s", transaction_id)
        raise

    t.amount = _to_absolute(t.amount)
    return t


# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

def get_summary(db: Session, month: Optional[str] = None) -> list[dict]:
    """
    Returns a list of SummaryResponse-shaped dicts, one per month (or one if
    month is specified).
    """
    q = db.query(Transaction)
    if month:
        year, mon = int(month[:4]), int(month[5:7])
        q = q.filter(
            extract("year", Transaction.timestamp) == year,
            extract("month", Transaction.timestamp) == mon,
        )

    transactions = q.all()

    # Group by month → category → type
    from collections import defaultdict

    months: dict = defaultdict(lambda: defaultdict(lambda: {"total": 0.0, "count": 0}))
    month_types: dict = defaultdict(lambda: {"income": 0.0, "expense": 0.0})

    for t in transactions:
        abs_amount = abs(t.amount)
        month_key = t.timestamp.strftime("%Y-%m")
        cat_type_key = (t.category or "Uncategorized", t.transaction_type)
        months[month_key][cat_type_key]["total"] += abs_amount
        months[month_key][cat_type_key]["count"] += 1
        month_types[month_key][t.transaction_type] += abs_amount

    results = []
    for mk in sorted(months.keys()):
        categories = []
        for (cat, ttype), agg in months[mk].items():
            categories.append(
                {
                    "category": cat,
                    "transaction_type": ttype,
                    "total": round(agg["total"], 2),
                    "count": agg["count"],
                }
            )
        total_income = round(month_types[mk]["income"], 2)
        total_expense = round(month_types[mk]["expense"], 2)
        results.append(
            {
                "month": mk,
                "total_income": total_income,
                "total_expense": total_expense,
                "net": round(total_income - total_expense, 2),
                "categories": categories,
            }
        )

    return results
