"""
Auto-categorization logic.

Rules:
- Keyword matching is case-insensitive substring search.
- Short ambiguous keywords (ola, bus) use word-boundary matching to avoid
  false positives (e.g. "Cola" must NOT match Transport).
- First match in the ordered table wins.
- No match → "Uncategorized".
"""

import re

# Categories that can only appear with expenses / income respectively.
EXPENSE_ONLY_CATEGORIES = frozenset(
    ["Food", "Transport", "Rent", "Utilities", "Shopping", "Entertainment", "Health", "Travel"]
)
INCOME_ONLY_CATEGORIES = frozenset(["Salary", "Freelance", "Investment"])

# Keywords that need word-boundary protection (short or easily embedded in other words).
_WORD_BOUNDARY_KEYWORDS = frozenset(
    ["ola", "bus", "gym", "rent", "lease", "stock", "train ticket"]
)

# Ordered list of (category, [keywords]).  First match wins.
CATEGORY_KEYWORDS: list[tuple[str, list[str]]] = [
    ("Food", ["mcdonald", "kfc", "burger", "pizza", "restaurant", "cafe", "starbucks", "swiggy", "zomato", "grocery", "supermarket"]),
    ("Transport", ["uber", "ola", "lyft", "taxi", "metro", "fuel", "petrol", "bus", "parking"]),
    ("Travel", ["flight", "airline", "hotel", "airbnb", "booking", "train ticket"]),
    ("Rent", ["rent", "lease", "landlord"]),
    ("Utilities", ["electricity", "water bill", "internet", "broadband", "gas bill", "mobile recharge"]),
    ("Shopping", ["amazon", "flipkart", "walmart", "mall", "clothes"]),
    ("Entertainment", ["netflix", "spotify", "cinema", "movie", "prime video", "concert"]),
    ("Health", ["pharmacy", "hospital", "doctor", "clinic", "gym"]),
    ("Salary", ["salary", "payroll", "paycheck"]),
    ("Freelance", ["freelance", "invoice", "client payment"]),
    ("Investment", ["dividend", "interest", "mutual fund", "stock"]),
]


def _normalize(text: str) -> str:
    """Lowercase, collapse whitespace, strip leading/trailing space."""
    text = text.lower().strip()
    text = re.sub(r"['\u2019\u2018]", "", text)  # remove apostrophes / smart quotes
    text = re.sub(r"\s+", " ", text)
    return text


def _matches(keyword: str, text: str) -> bool:
    """Return True if keyword appears in text, using word boundaries for short keywords."""
    if keyword in _WORD_BOUNDARY_KEYWORDS:
        pattern = r"\b" + re.escape(keyword) + r"\b"
        return bool(re.search(pattern, text))
    return keyword in text


def categorize(description: str) -> str:
    """Return the category for a description, or 'Uncategorized'."""
    normalized = _normalize(description)
    for category, keywords in CATEGORY_KEYWORDS:
        for kw in keywords:
            if _matches(kw, normalized):
                return category
    return "Uncategorized"


def validate_category_type(category: str, transaction_type: str) -> bool:
    """
    Return True if the category is compatible with the transaction type.
    Free-text categories (not in either set) are allowed with both types.
    """
    if category in EXPENSE_ONLY_CATEGORIES and transaction_type == "income":
        return False
    if category in INCOME_ONLY_CATEGORIES and transaction_type == "expense":
        return False
    return True
