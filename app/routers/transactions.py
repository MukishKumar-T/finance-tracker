import re
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from app.database import get_db
from app.schemas import (
    TransactionCreate,
    TransactionResponse,
    PaginatedTransactions,
    ReclassifyRequest,
    SummaryResponse,
)
from app.services import (
    create_transaction,
    list_transactions,
    delete_transaction,
    reclassify_transaction,
    get_summary,
    export_transactions_csv,
)
from app.exceptions import DuplicateTransactionError, CategoryTypeMismatchError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/transactions", tags=["transactions"])

_MONTH_RE = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")
_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def _validate_month(month: Optional[str]) -> Optional[str]:
    if month and not _MONTH_RE.match(month):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="month must be in YYYY-MM format",
        )
    return month


def _validate_date(d: Optional[str], name: str) -> Optional[str]:
    if d and not _DATE_RE.match(d):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{name} must be in YYYY-MM-DD format",
        )
    return d


# ---------------------------------------------------------------------------
# IMPORTANT: /summary and /export must be declared BEFORE /{transaction_id}
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


@router.get(
    "/export",
    operation_id="export_transactions_csv",
    summary="Export transactions as CSV",
    responses={200: {"content": {"text/csv": {}}}},
)
def export_csv(
    month: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None, description="Keyword search on description"),
    date_from: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    date_to: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    db: Session = Depends(get_db),
):
    _validate_month(month)
    _validate_date(date_from, "date_from")
    _validate_date(date_to, "date_to")

    csv_data = export_transactions_csv(
        db,
        month=month,
        transaction_type=type,
        category=category,
        search=search,
        date_from=date_from,
        date_to=date_to,
    )
    return StreamingResponse(
        io.StringIO(csv_data),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"},
    )


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
    response_model=PaginatedTransactions,
    operation_id="list_transactions",
    responses={422: {"description": "Invalid filter value"}},
    summary="List transactions with optional filters, search, sort and pagination",
)
def list_all(
    month: Optional[str] = Query(None, description="Filter by month (YYYY-MM)"),
    type: Optional[str] = Query(None, description="Filter by type: income or expense"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Keyword search on description"),
    date_from: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    date_to: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    sort_by: str = Query("timestamp", description="Sort field: timestamp | amount | category"),
    sort_dir: str = Query("desc", description="Sort direction: asc | desc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    _validate_month(month)
    _validate_date(date_from, "date_from")
    _validate_date(date_to, "date_to")

    if type and type not in ("income", "expense"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="type must be 'income' or 'expense'",
        )
    if sort_by not in ("timestamp", "amount", "category"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="sort_by must be timestamp, amount, or category",
        )
    if sort_dir not in ("asc", "desc"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="sort_dir must be asc or desc",
        )

    return list_transactions(
        db,
        month=month,
        transaction_type=type,
        category=category,
        search=search,
        date_from=date_from,
        date_to=date_to,
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )


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
