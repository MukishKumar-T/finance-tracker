class DuplicateTransactionError(Exception):
    """Raised when a transaction is a duplicate of an existing one."""

    def __init__(self, existing_id: int):
        self.existing_id = existing_id
        super().__init__(
            f"Duplicate transaction detected. Existing transaction id: {existing_id}"
        )


class CategoryTypeMismatchError(Exception):
    """Raised when the category is inconsistent with the transaction type."""

    def __init__(self, category: str, transaction_type: str):
        self.category = category
        self.transaction_type = transaction_type
        super().__init__(
            f"Category '{category}' cannot be used with transaction type '{transaction_type}'"
        )
