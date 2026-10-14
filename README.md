# XpenseSlate

Records income and expenses, auto-categorizes transactions from their description, detects duplicates within a configurable time window, and reports monthly summaries per category.

---

## Features

- **Auto-categorization** — keyword-based rules map descriptions to 11 categories
- **Duplicate detection** — rejects identical transactions submitted within 5 minutes
- **Type/category consistency** — expense-only and income-only categories are enforced
- **Monthly summaries** — totals grouped by month and category
- **Manual reclassification** — override a category; auto-tagging will never revert it
- **React UI** — add, filter, delete, reclassify, view summary and expense pie chart
- **Generated Python SDK** — OpenAPI Generator CLI produces a typed `finance_sdk` package

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| Java (JRE) | 11+ *(for SDK generation only)* |
| OS | Windows |
| sqlite3 CLI | Optional *(seed data loading)* |

---

## Setup

```bat
.\setupdev.bat
```

This script:
1. Creates a Python virtual environment (`env\`)
2. Installs all Python dependencies from `requirements.txt`
3. Runs `alembic upgrade head` to create the SQLite schema
4. Loads `seed_data.sql` if `finance.db` doesn't exist yet and `sqlite3` is available
5. Runs `npm install` in the `frontend\` directory

### Manual setup (if the script fails at any step)

```bat
python -m venv env
call env\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
sqlite3 finance.db < seed_data.sql
cd frontend
npm install
cd ..
```

---

## Running the Application

```bat
.\runapplication.bat
```

Two terminal windows open:
- **Backend** — `http://localhost:8000`
- **Frontend** — `http://localhost:3000`

| URL | Purpose |
|-----|---------|
| `http://localhost:8000` | FastAPI REST API |
| `http://localhost:8000/docs` | Swagger UI |
| `http://localhost:8000/openapi.json` | OpenAPI schema |
| `http://localhost:3000` | React UI |

---

## Migrations

```bat
:: Apply all pending migrations
alembic upgrade head

:: Roll back one step
alembic downgrade -1
```

The initial migration creates the `transactions` table with a `CHECK` constraint on `transaction_type` and indexes on `timestamp` and `(description, amount)`.

---

## Seed Data

```bat
sqlite3 finance.db < seed_data.sql
```

30 rows spread over August–October 2026, covering all categories, one manually reclassified row (`auto_tagged = 0`), mixed income and expense.

---

## API Summary

| Method | Path | Description |
|--------|------|-------------|
| POST | `/transactions/` | Create a transaction |
| GET | `/transactions/` | List with optional filters (`month`, `type`, `category`, `skip`, `limit`) |
| GET | `/transactions/summary` | Monthly summary (`month` optional) |
| DELETE | `/transactions/{id}` | Delete a transaction |
| PATCH | `/transactions/{id}/reclassify` | Update category (manual override) |

### Business Rules

| Rule | Behaviour |
|------|-----------|
| R1 Type validation | `income` or `expense` only (case-insensitive) → else `422` |
| R2 Auto-categorization | Keyword match → category; no match → `Uncategorized` |
| R3 Type/category consistency | Expense-only categories block `income` entries, and vice versa → `422` |
| R4 Duplicate detection | Same amount + description + type within 5 min → `409` |
| R5 Sign storage | Expenses stored negative; responses always show absolute values |
| R6 Summary aggregation | Grouped by `YYYY-MM` and category; absolute totals |
| R7 Manual reclassification | Sets `auto_tagged = false`; never overwritten by auto-categorization |

---

## SDK Generation

Requires the backend to be running and Java 11+ installed.

```bat
npm install -g @openapitools/openapi-generator-cli

openapi-generator-cli generate -i http://localhost:8000/openapi.json -g python -o finance_sdk --package-name finance_sdk

call env\Scripts\activate
pip install -e finance_sdk
python sdk_example.py
```

The generated package is in `finance_sdk\`. Never hand-edit it — regenerate when the API changes.

---

## Running Tests

```bat
call env\Scripts\activate
pytest -q
```

Coverage report:

```bat
pytest --cov=app --cov-report=term-missing -q
```

### Test areas

- Categorizer: keyword matching, word-boundary rules, Cola ≠ Transport
- Create: valid and invalid payloads, sign storage, custom category
- Type consistency: Rent as income → 422, Salary as expense → 422
- Duplicates: within/outside window, case-insensitive description matching
- List / filters: by month, type, category, pagination
- Summary: grouping, absolute values, net, empty period, `/summary` route order
- Reclassify: category change, `auto_tagged` flip, 404, invalid category
- Delete: 204 then 404

---

## Design Decisions

**Sign convention** — Expenses are stored as negative numbers in the DB to make aggregation trivial (`SUM(amount)` gives net directly). The API layer always converts to absolute values on responses so clients never see negative amounts.

**Duplicate window** — Default 5 minutes, configurable via `DUPLICATE_WINDOW_MINUTES` env var or `.env` file. Comparison uses `abs()` and rounds to 2 decimal places to avoid float precision issues.

**Word-boundary matching** — Short keywords like `ola` and `bus` use regex `\b...\b` so "Cola" doesn't trigger Transport and "business" doesn't trigger Transport.

**`/summary` route order** — Declared before `/{transaction_id}` so FastAPI doesn't attempt to parse the literal string `summary` as an integer.

**`runapplication.bat`** — Uses `start` to open each process in its own window, so the frontend command doesn't block waiting for the backend.

**Alembic `render_as_batch=True`** — Required for SQLite because it doesn't support `ALTER COLUMN` natively; batch mode recreates the table under the hood.
