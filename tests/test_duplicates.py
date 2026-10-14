"""
Tests for duplicate detection (Rule R4).
"""
import pytest
from unittest.mock import patch
from datetime import datetime, timedelta


BASE_PAYLOAD = {
    "description": "Uber to airport",
    "amount": 450.50,
    "transaction_type": "expense",
}


class TestDuplicateDetection:
    def test_duplicate_within_window_returns_409(self, client):
        client.post("/transactions/", json=BASE_PAYLOAD)
        resp = client.post("/transactions/", json=BASE_PAYLOAD)
        assert resp.status_code == 409
        assert "Duplicate" in resp.json()["detail"]

    def test_duplicate_includes_existing_id(self, client):
        first = client.post("/transactions/", json=BASE_PAYLOAD)
        existing_id = first.json()["id"]
        second = client.post("/transactions/", json=BASE_PAYLOAD)
        assert str(existing_id) in second.json()["detail"]

    def test_same_description_different_amount_is_not_duplicate(self, client):
        client.post("/transactions/", json=BASE_PAYLOAD)
        other = {**BASE_PAYLOAD, "amount": 999.99}
        resp = client.post("/transactions/", json=other)
        assert resp.status_code == 201

    def test_same_amount_different_description_is_not_duplicate(self, client):
        client.post("/transactions/", json=BASE_PAYLOAD)
        other = {**BASE_PAYLOAD, "description": "Lyft to office"}
        resp = client.post("/transactions/", json=other)
        assert resp.status_code == 201

    def test_same_payload_different_type_is_not_duplicate(self, client):
        """Same description and amount but different type should not be flagged."""
        client.post("/transactions/", json=BASE_PAYLOAD)
        other = {**BASE_PAYLOAD, "transaction_type": "income", "category": "Freelance"}
        resp = client.post("/transactions/", json=other)
        assert resp.status_code == 201

    def test_duplicate_case_insensitive_description(self, client):
        """Normalized descriptions should trigger duplicate detection."""
        client.post("/transactions/", json=BASE_PAYLOAD)
        other = {**BASE_PAYLOAD, "description": "UBER TO AIRPORT"}
        resp = client.post("/transactions/", json=other)
        assert resp.status_code == 409

    def test_outside_window_is_not_duplicate(self, client):
        """A transaction with the same data but outside the window should succeed."""
        future_time = datetime.utcnow() + timedelta(minutes=10)
        # First transaction at 'now', second patched to be 10 minutes later
        client.post("/transactions/", json=BASE_PAYLOAD)

        with patch("app.services.datetime") as mock_dt:
            mock_dt.utcnow.return_value = future_time
            resp = client.post("/transactions/", json=BASE_PAYLOAD)

        assert resp.status_code == 201
