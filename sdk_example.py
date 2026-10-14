"""
SDK smoke test.

Prerequisites:
  1. Backend must be running: python main.py
  2. SDK already generated and installed:
       pip install -e finance_sdk
"""

from finance_sdk.api_client import ApiClient
from finance_sdk.configuration import Configuration
from finance_sdk.api.transactions_api import TransactionsApi

config = Configuration(host="http://localhost:8000")
client = ApiClient(config)
api = TransactionsApi(client)

print("=== Listing transactions ===")
transactions = api.list_transactions()
for t in transactions:
    print(f"  [{t.id}] {t.description} | {t.transaction_type} | {t.amount} | {t.category}")

print("\n=== Monthly summary ===")
summary = api.get_monthly_summary()
for s in summary:
    print(f"  {s.month}: income={s.total_income}, expense={s.total_expense}, net={s.net}")
