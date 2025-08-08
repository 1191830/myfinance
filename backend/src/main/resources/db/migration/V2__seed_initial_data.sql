-- ===============================
-- Seed initial categories
-- ===============================
INSERT INTO categories (name) VALUES
                                  ('Food'),
                                  ('Transport'),
                                  ('Salary'),
                                  ('Investment'),
                                  ('Entertainment'),
                                  ('Health');

-- ===============================
-- Seed initial saving goals
-- ===============================
INSERT INTO saving_goals (name, target_amount, current_amount, start_date, end_date) VALUES
                                                                                         ('Vacation', 2000, 500, '2025-01-01', '2025-12-31'),
                                                                                         ('Emergency Fund', 5000, 1500, '2024-06-01', NULL),
                                                                                         ('New Laptop', 1500, 0, '2025-06-01', '2025-09-01');

-- ===============================
-- Seed initial investments
-- ===============================
INSERT INTO investments (type, ticker, amount_invested, current_value, start_date, notes, last_synced) VALUES
                                                                                                           ('ETF', 'VOO', 10000, 10500, '2023-01-01', 'S&P 500 ETF', CURRENT_TIMESTAMP),
                                                                                                           ('Stock', 'AAPL', 5000, 6200, '2024-03-15', 'Apple stock', CURRENT_TIMESTAMP),
                                                                                                           ('Crypto', 'BTC', 2000, 1800, '2025-01-10', 'Bitcoin investment', CURRENT_TIMESTAMP);

-- ===============================
-- Seed initial transactions
-- ===============================
-- To insert transactions we need the category IDs. Assuming IDs are generated, we can do it by name lookup:
INSERT INTO transactions (type, frequency, category_id, amount, date, description)
VALUES
    ('EXPENSE', 'RECURRING', (SELECT id FROM categories WHERE name='Food'), 300, '2025-07-01', 'Monthly groceries'),
    ('EXPENSE', 'ONE_TIME', (SELECT id FROM categories WHERE name='Transport'), 50, '2025-07-03', 'Taxi ride'),
    ('INCOME', 'RECURRING', (SELECT id FROM categories WHERE name='Salary'), 2500, '2025-07-05', 'Monthly salary'),
    ('INCOME', 'ONE_TIME', (SELECT id FROM categories WHERE name='Investment'), 200, '2025-07-10', 'Dividends payment'),
    ('EXPENSE', 'ONE_TIME', (SELECT id FROM categories WHERE name='Entertainment'), 100, '2025-07-12', 'Concert ticket');
