-- V1__initial_schema.sql

-- ===============================
-- Enum types
-- ===============================
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE');

CREATE TYPE transaction_frequency AS ENUM ('ONE_TIME', 'RECURRING');

-- ===============================
-- Categories
-- ===============================
CREATE TABLE categories (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            name TEXT NOT NULL
);

-- ===============================
-- Transactions
-- ===============================
CREATE TABLE transactions (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              type transaction_type NOT NULL,
                              frequency transaction_frequency NOT NULL,
                              category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
                              amount NUMERIC(12, 2) NOT NULL,
                              date DATE NOT NULL,
                              description TEXT
);

-- ===============================
-- Investments
-- ===============================
CREATE TABLE investments (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             type TEXT NOT NULL, -- e.g., 'ETF', 'Stock', 'Crypto'
                             ticker TEXT,        -- optional for automatic sync
                             amount_invested NUMERIC(12, 2) NOT NULL,
                             current_value NUMERIC(12, 2) NOT NULL,
                             start_date DATE NOT NULL,
                             notes TEXT,
                             last_synced TIMESTAMP
);

-- ===============================
-- Saving Goals
-- ===============================
CREATE TABLE saving_goals (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              name TEXT NOT NULL,
                              target_amount NUMERIC(12, 2) NOT NULL,
                              current_amount NUMERIC(12, 2) DEFAULT 0,
                              start_date DATE NOT NULL,
                              end_date DATE
);

-- ===============================
-- Indexes & Constraints
-- ===============================
CREATE UNIQUE INDEX unique_category_name ON categories (LOWER(name));

CREATE INDEX idx_transaction_date ON transactions (date);
