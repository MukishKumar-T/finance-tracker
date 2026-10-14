import re
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import (
    TransactionCreate,
    TransactionResponse,
    ReclassifyRequest,
    SummaryResponse,
)
from app.services import (
    create_transaction,
    list_transactions,
    delete_transaction,
    reclassify_transaction,
    get_summary,
)
from app.exceptions import DuplicateTransactionError, CategoryTypeMismatchError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/transactions", tags=["transactions"])

_MONTH_RE = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")


def _validate_month(month: Optional[str]) -> Optional[str]:
    if month and not _MONTH_RE.match(month):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="month must be in YYYY-MM format",
        )
    return month


# ---------------------------------------------------------------------------
# IMPORTANT: /summary must be declared BEFORE /{transaction_id}
# ---------------------------------------------------------------------------

@router.get(
    "/summary",
    response_model=list[SummaryResponse],
    operation_id="get_monthly_summary",
    responses={422: {"description": "Invalid month format"}},
    summary="Get monthly summary grouped by category",
)
def get_monthly_summary(
    month: Optional[str] = Query(None, description="Filter to a specific month (YYYY-MM)"),
    db: Session = Depends(get_db),
):
    _validate_month(month)
    return get_summary(db, month)


# ---------------------------------------------------------------------------
# POST /transactions/
# ---------------------------------------------------------------------------

@router.post(
    "/",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    operation_id="create_transaction",
    responses={
        409: {"description": "Duplicate transaction"},
        422: {"description": "Validation error"},
    },
    summary="Create a new transaction",
)
def create(data: TransactionCreate, db: Session = Depends(get_db)):
    try:
        return create_transaction(db, data)
    except DuplicateTransactionError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Duplicate transaction. Existing id: {exc.existing_id}",
        )
    except CategoryTypeMismatchError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )


# ---------------------------------------------------------------------------
# GET /transactions/
# ---------------------------------------------------------------------------

@router.get(
    "/",
    response_model=list[TransactionResponse],
    operation_id="list_transactions",
    responses={422: {"description": "Invalid filter value"}},
    summary="List transactions with optional filters",
)
def list_all(
    month: Optional[str] = Query(None, description="Filter by month (YYYY-MM)"),
    type: Optional[str] = Query(None, description="Filter by type: income or expense"),
    category: Optional[str] = Query(None, description="Filter by category"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    _validate_month(month)
    if type and type not in ("income", "expense"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="type must be 'income' or 'expense'",
        )
    return list_transactions(db, month=month, transaction_type=type, category=category, skip=skip, limit=limit)


# ---------------------------------------------------------------------------
# DELETE /transactions/{transaction_id}
# ---------------------------------------------------------------------------

@router.delete(
    "/{transaction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    operation_id="delete_transaction",
    responses={404: {"description": "Transaction not found"}},
    summary="Delete a transaction",
)
def delete(transaction_id: int, db: Session = Depends(get_db)):
    result = delete_transaction(db, transaction_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction {transaction_id} not found",
        )


# ---------------------------------------------------------------------------
# PATCH /transactions/{transaction_id}/reclassify
# ---------------------------------------------------------------------------

@router.patch(
    "/{transaction_id}/reclassify",
    response_model=TransactionResponse,
    operation_id="reclassify_transaction",
    responses={
        404: {"description": "Transaction not found"},
        422: {"description": "Validation error"},
    },
    summary="Manually reclassify a transaction's category",
)
def reclassify(
    transaction_id: int,
    data: ReclassifyRequest,
    db: Session = Depends(get_db),
):
    try:
        result = reclassify_transaction(db, transaction_id, data.category)
    except CategoryTypeMismatchError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction {transaction_id} not found",
        )
    return result
