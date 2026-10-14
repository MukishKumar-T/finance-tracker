import pytest
from app.categorizer import categorize, validate_category_type


class TestCategorize:
    def test_mcdonalds_food(self):
        assert categorize("McDonald's lunch") == "Food"

    def test_mcdonalds_case_insensitive(self):
        assert categorize("MCDONALD COMBO") == "Food"

    def test_uber_transport(self):
        assert categorize("Uber to airport") == "Transport"

    def test_zomato_food(self):
        assert categorize("Zomato food delivery") == "Food"

    def test_cola_not_transport(self):
        """'Cola' contains 'ola' but must NOT match Transport (word-boundary rule)."""
        result = categorize("Cola drink purchase")
        assert result != "Transport"

    def test_ola_transport(self):
        """'Ola cab' should match Transport."""
        assert categorize("Ola cab ride") == "Transport"

    def test_bus_transport(self):
        assert categorize("Bus fare city route") == "Transport"

    def test_bus_word_boundary(self):
        """'business' must NOT match Transport via 'bus'."""
        result = categorize("business lunch meeting")
        assert result != "Transport"

    def test_unknown_description(self):
        assert categorize("Random unknown transaction XYZ") == "Uncategorized"

    def test_punctuation_insensitivity(self):
        """Apostrophes are stripped before matching."""
        assert categorize("McDonald's cafe order") == "Food"

    def test_netflix_entertainment(self):
        assert categorize("Netflix subscription") == "Entertainment"

    def test_salary(self):
        assert categorize("Monthly salary credit") == "Salary"

    def test_freelance(self):
        assert categorize("Freelance invoice payment") == "Freelance"

    def test_investment(self):
        assert categorize("Dividend from mutual fund") == "Investment"

    def test_flight_travel(self):
        assert categorize("Flight to Mumbai") == "Travel"

    def test_rent(self):
        assert categorize("Rent payment for apartment") == "Rent"

    def test_gym_health(self):
        assert categorize("Gym membership fee") == "Health"

    def test_case_upper(self):
        assert categorize("UBER TO OFFICE") == "Transport"


class TestValidateCategoryType:
    def test_expense_category_with_expense_ok(self):
        assert validate_category_type("Food", "expense") is True

    def test_expense_category_with_income_fails(self):
        assert validate_category_type("Rent", "income") is False

    def test_income_category_with_income_ok(self):
        assert validate_category_type("Salary", "income") is True

    def test_income_category_with_expense_fails(self):
        assert validate_category_type("Salary", "expense") is False

    def test_free_text_category_with_expense_ok(self):
        assert validate_category_type("Wellness", "expense") is True

    def test_free_text_category_with_income_ok(self):
        assert validate_category_type("Bonus", "income") is True

    def test_uncategorized_with_either(self):
        assert validate_category_type("Uncategorized", "expense") is True
        assert validate_category_type("Uncategorized", "income") is True
