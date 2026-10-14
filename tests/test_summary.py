"""
Tests for the monthly summary endpoint.
"""
import pytest


def _post(client, desc, amount, ttype, category=None):
    payload = {"description": desc, "amount": amount, "transaction_type": ttype}
    if category:
        payload["category"] = category
    return client.post("/transactions/", json=payload)


class TestSummary:
    def test_summary_route_not_shadowed_by_id(self, client):
        """GET /transactions/summary must NOT be parsed as /{transaction_id}."""
        resp = client.get("/transactions/summary")
        assert resp.status_code == 200  # not 422 "value is not a valid integer"

    def test_empty_summary(self, client):
        resp = client.get("/transactions/summary")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_single_month_summary(self, client):
        _post(client, "Monthly salary", 50000, "income", "Salary")
        _post(client, "Uber ride", 300, "expense")
        _post(client, "Pizza dinner", 500, "expense")

        resp = client.get("/transactions/summary")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        month_data = data[0]
        assert month_data["total_income"] == 50000.0
        assert month_data["total_expense"] == 800.0
        assert month_data["net"] == 49200.0

    def test_amounts_are_absolute_in_summary(self, client):
        _post(client, "Rent payment", 15000, "expense", "Rent")
        resp = client.get("/transactions/summary")
        data = resp.json()[0]
        assert data["total_expense"] == 15000.0
        # All category totals positive
        for cat in data["categories"]:
            assert cat["total"] > 0

    def test_filter_by_month(self, client):
        _post(client, "Monthly salary", 50000, "income", "Salary")
        resp = client.get("/transactions/summary?month=2030-01")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_invalid_month_format_returns_422(self, client):
        resp = client.get("/transactions/summary?month=2026/10")
        assert resp.status_code == 422

    def test_category_grouping(self, client):
        _post(client, "Uber ride 1", 200, "expense")
        _post(client, "Uber ride 2", 300, "expense")
        _post(client, "Pizza order", 400, "expense")

        resp = client.get("/transactions/summary")
        data = resp.json()[0]
        transport_entry = next(
            (c for c in data["categories"] if c["category"] == "Transport"), None
        )
        assert transport_entry is not None
        assert transport_entry["total"] == 500.0
        assert transport_entry["count"] == 2
