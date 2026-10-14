import pytest


class TestCreateTransaction:
    def test_valid_expense(self, client):
        resp = client.post("/transactions/", json={
            "description": "Uber to airport",
            "amount": 450.50,
            "transaction_type": "expense"
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["amount"] == 450.50          # absolute value
        assert data["transaction_type"] == "expense"
        assert data["category"] == "Transport"
        assert data["auto_tagged"] is True

    def test_valid_income(self, client):
        resp = client.post("/transactions/", json={
            "description": "Monthly salary",
            "amount": 50000.0,
            "transaction_type": "income"
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["amount"] == 50000.0
        assert data["transaction_type"] == "income"
        assert data["category"] == "Salary"

    def test_invalid_type_returns_422(self, client):
        resp = client.post("/transactions/", json={
            "description": "Some payment",
            "amount": 100.0,
            "transaction_type": "transfer"
        })
        assert resp.status_code == 422

    def test_amount_zero_returns_422(self, client):
        resp = client.post("/transactions/", json={
            "description": "Zero amount",
            "amount": 0,
            "transaction_type": "expense"
        })
        assert resp.status_code == 422

    def test_negative_amount_returns_422(self, client):
        resp = client.post("/transactions/", json={
            "description": "Negative amount",
            "amount": -50.0,
            "transaction_type": "expense"
        })
        assert resp.status_code == 422

    def test_blank_description_returns_422(self, client):
        resp = client.post("/transactions/", json={
            "description": "   ",
            "amount": 100.0,
            "transaction_type": "expense"
        })
        assert resp.status_code == 422

    def test_missing_description_returns_422(self, client):
        resp = client.post("/transactions/", json={
            "amount": 100.0,
            "transaction_type": "expense"
        })
        assert resp.status_code == 422

    def test_missing_amount_returns_422(self, client):
        resp = client.post("/transactions/", json={
            "description": "Some expense",
            "transaction_type": "expense"
        })
        assert resp.status_code == 422

    def test_type_case_insensitive(self, client):
        """Transaction type should be accepted in any case."""
        resp = client.post("/transactions/", json={
            "description": "Pizza order",
            "amount": 200.0,
            "transaction_type": "EXPENSE"
        })
        assert resp.status_code == 201
        assert resp.json()["transaction_type"] == "expense"

    def test_custom_category_overrides_auto(self, client):
        resp = client.post("/transactions/", json={
            "description": "Uber to airport",
            "amount": 450.0,
            "transaction_type": "expense",
            "category": "Travel"
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["category"] == "Travel"
        assert data["auto_tagged"] is False


class TestTypeConsistency:
    def test_rent_as_income_returns_422(self, client):
        resp = client.post("/transactions/", json={
            "description": "Rent payment",
            "amount": 5000.0,
            "transaction_type": "income",
            "category": "Rent"
        })
        assert resp.status_code == 422

    def test_salary_as_expense_returns_422(self, client):
        resp = client.post("/transactions/", json={
            "description": "Salary deduction",
            "amount": 1000.0,
            "transaction_type": "expense",
            "category": "Salary"
        })
        assert resp.status_code == 422

    def test_food_auto_categorized_expense_ok(self, client):
        resp = client.post("/transactions/", json={
            "description": "McDonald's lunch",
            "amount": 300.0,
            "transaction_type": "expense"
        })
        assert resp.status_code == 201

    def test_food_category_as_income_returns_422(self, client):
        resp = client.post("/transactions/", json={
            "description": "Some income",
            "amount": 1000.0,
            "transaction_type": "income",
            "category": "Food"
        })
        assert resp.status_code == 422


class TestListTransactions:
    def _seed(self, client):
        transactions = [
            {"description": "Salary credit", "amount": 50000, "transaction_type": "income"},
            {"description": "Uber ride", "amount": 200, "transaction_type": "expense"},
            {"description": "Pizza order", "amount": 500, "transaction_type": "expense"},
        ]
        for t in transactions:
            client.post("/transactions/", json=t)

    def test_list_all(self, client):
        self._seed(client)
        resp = client.get("/transactions/")
        assert resp.status_code == 200
        assert len(resp.json()) == 3

    def test_filter_by_type_expense(self, client):
        self._seed(client)
        resp = client.get("/transactions/?type=expense")
        assert resp.status_code == 200
        results = resp.json()
        assert all(t["transaction_type"] == "expense" for t in results)
        assert len(results) == 2

    def test_filter_by_type_income(self, client):
        self._seed(client)
        resp = client.get("/transactions/?type=income")
        assert resp.status_code == 200
        results = resp.json()
        assert len(results) == 1

    def test_filter_by_category(self, client):
        self._seed(client)
        resp = client.get("/transactions/?category=Transport")
        assert resp.status_code == 200
        results = resp.json()
        assert all(t["category"] == "Transport" for t in results)

    def test_invalid_type_filter_422(self, client):
        resp = client.get("/transactions/?type=unknown")
        assert resp.status_code == 422

    def test_pagination(self, client):
        self._seed(client)
        resp = client.get("/transactions/?skip=1&limit=1")
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    def test_amounts_are_absolute(self, client):
        self._seed(client)
        resp = client.get("/transactions/")
        assert resp.status_code == 200
        for t in resp.json():
            assert t["amount"] > 0


class TestDeleteTransaction:
    def test_delete_existing(self, client):
        create_resp = client.post("/transactions/", json={
            "description": "Taxi ride", "amount": 150, "transaction_type": "expense"
        })
        tid = create_resp.json()["id"]
        del_resp = client.delete(f"/transactions/{tid}")
        assert del_resp.status_code == 204

    def test_delete_nonexistent_returns_404(self, client):
        resp = client.delete("/transactions/999999")
        assert resp.status_code == 404

    def test_delete_then_404(self, client):
        create_resp = client.post("/transactions/", json={
            "description": "Bus ticket", "amount": 50, "transaction_type": "expense"
        })
        tid = create_resp.json()["id"]
        client.delete(f"/transactions/{tid}")
        resp = client.delete(f"/transactions/{tid}")
        assert resp.status_code == 404
