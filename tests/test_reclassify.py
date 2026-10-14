"""
Tests for the reclassify endpoint.
"""
import pytest


class TestReclassify:
    def _create_uber(self, client):
        resp = client.post("/transactions/", json={
            "description": "Uber to office",
            "amount": 200.0,
            "transaction_type": "expense"
        })
        assert resp.status_code == 201
        return resp.json()

    def test_reclassify_changes_category(self, client):
        t = self._create_uber(client)
        assert t["category"] == "Transport"
        assert t["auto_tagged"] is True

        resp = client.patch(f"/transactions/{t['id']}/reclassify", json={"category": "Travel"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["category"] == "Travel"
        assert data["auto_tagged"] is False

    def test_reclassify_sets_manual_flag(self, client):
        t = self._create_uber(client)
        client.patch(f"/transactions/{t['id']}/reclassify", json={"category": "Travel"})

        # Verify via list endpoint
        resp = client.get("/transactions/")
        matched = next(x for x in resp.json()["items"] if x["id"] == t["id"])
        assert matched["auto_tagged"] is False

    def test_reclassify_nonexistent_returns_404(self, client):
        resp = client.patch("/transactions/999999/reclassify", json={"category": "Travel"})
        assert resp.status_code == 404

    def test_reclassify_blank_category_returns_422(self, client):
        t = self._create_uber(client)
        resp = client.patch(f"/transactions/{t['id']}/reclassify", json={"category": "  "})
        assert resp.status_code == 422

    def test_reclassify_type_inconsistent_category_returns_422(self, client):
        """Reclassifying an expense transaction to an income-only category must fail."""
        t = self._create_uber(client)
        resp = client.patch(f"/transactions/{t['id']}/reclassify", json={"category": "Salary"})
        assert resp.status_code == 422

    def test_reclassify_income_to_expense_category_returns_422(self, client):
        income = client.post("/transactions/", json={
            "description": "Monthly salary",
            "amount": 50000,
            "transaction_type": "income"
        }).json()
        resp = client.patch(f"/transactions/{income['id']}/reclassify", json={"category": "Food"})
        assert resp.status_code == 422

    def test_reclassify_to_free_text_category_ok(self, client):
        """Categories not in the standard table are allowed."""
        t = self._create_uber(client)
        resp = client.patch(f"/transactions/{t['id']}/reclassify", json={"category": "Wellness"})
        assert resp.status_code == 200
        assert resp.json()["category"] == "Wellness"

    def test_manual_not_overridden_by_auto(self, client):
        """
        After manual reclassification, the transaction should keep the manual
        category (auto_tagged stays False). This is enforced at service level.
        """
        t = self._create_uber(client)
        client.patch(f"/transactions/{t['id']}/reclassify", json={"category": "Travel"})

        # Re-fetch and confirm auto_tagged is still False
        resp = client.get("/transactions/")
        matched = next(x for x in resp.json()["items"] if x["id"] == t["id"])
        assert matched["auto_tagged"] is False
        assert matched["category"] == "Travel"
