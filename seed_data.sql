-- Seed data for Personal Finance Tracker
-- Load with: sqlite3 finance.db < seed_data.sql
--
-- Sign convention: expenses are negative, income is positive.
-- Timestamps spread over 3 months: 2026-08, 2026-09, 2026-10.
-- Includes every category, one auto_tagged=0 row, and no duplicates.

INSERT INTO transactions (description, amount, transaction_type, category, auto_tagged, timestamp) VALUES
-- ======================== August 2026 ========================
('Monthly salary August',           50000.00,  'income',  'Salary',         1, '2026-08-01 09:00:00'),
('Freelance invoice – client A',     8000.00,  'income',  'Freelance',      1, '2026-08-05 11:00:00'),
('Dividend from mutual fund',         500.00,  'income',  'Investment',     1, '2026-08-10 14:00:00'),
('Zomato food delivery',             -650.00,  'expense', 'Food',           1, '2026-08-03 20:00:00'),
('Uber cab to office',               -320.00,  'expense', 'Transport',      1, '2026-08-04 08:30:00'),
('Rent payment August',            -15000.00,  'expense', 'Rent',           1, '2026-08-01 10:00:00'),
('Electricity bill August',         -1800.00,  'expense', 'Utilities',      1, '2026-08-07 12:00:00'),
('Amazon purchase – headphones',    -3500.00,  'expense', 'Shopping',       1, '2026-08-12 16:00:00'),
('Netflix subscription',             -499.00,  'expense', 'Entertainment',  1, '2026-08-15 18:00:00'),
('Pharmacy – vitamins',              -450.00,  'expense', 'Health',         1, '2026-08-20 10:00:00'),
('Flight to Mumbai',               -12000.00,  'expense', 'Travel',         1, '2026-08-25 07:00:00'),

-- ======================== September 2026 ========================
('Monthly salary September',        50000.00,  'income',  'Salary',         1, '2026-09-01 09:00:00'),
('Client payment – project B',       5000.00,  'income',  'Freelance',      1, '2026-09-10 11:00:00'),
('Stock dividend',                    200.00,  'income',  'Investment',     1, '2026-09-15 14:00:00'),
('McDonald''s lunch',                -450.00,  'expense', 'Food',           1, '2026-09-02 13:00:00'),
('Metro card recharge',              -500.00,  'expense', 'Transport',      1, '2026-09-05 08:00:00'),
('Rent payment September',         -15000.00,  'expense', 'Rent',           1, '2026-09-01 10:00:00'),
('Internet bill – broadband',       -1200.00,  'expense', 'Utilities',      1, '2026-09-06 12:00:00'),
('Flipkart – clothing',             -2200.00,  'expense', 'Shopping',       1, '2026-09-18 15:00:00'),
('Cinema tickets',                   -600.00,  'expense', 'Entertainment',  1, '2026-09-22 19:00:00'),
-- This row was manually reclassified (auto_tagged = 0)
('Gym membership fee',              -1500.00,  'expense', 'Wellness',       0, '2026-09-08 07:30:00'),
('Doctor consultation',              -800.00,  'expense', 'Health',         1, '2026-09-25 11:00:00'),

-- ======================== October 2026 ========================
('Monthly salary October',          50000.00,  'income',  'Salary',         1, '2026-10-01 09:00:00'),
('Freelance invoice – client C',     6500.00,  'income',  'Freelance',      1, '2026-10-07 11:00:00'),
('Mutual fund interest',              350.00,  'income',  'Investment',     1, '2026-10-10 14:00:00'),
('Starbucks coffee',                 -380.00,  'expense', 'Food',           1, '2026-10-03 08:00:00'),
('Fuel refill',                     -3000.00,  'expense', 'Transport',      1, '2026-10-05 17:00:00'),
('Rent payment October',           -15000.00,  'expense', 'Rent',           1, '2026-10-01 10:00:00'),
('Mobile recharge',                  -599.00,  'expense', 'Utilities',      1, '2026-10-02 12:00:00'),
('Spotify premium',                  -199.00,  'expense', 'Entertainment',  1, '2026-10-08 18:00:00');
