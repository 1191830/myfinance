-- Transaction type: income or expense
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE');

-- Transaction frequency: recurring or one-time
CREATE TYPE transaction_frequency AS ENUM ('ONE_TIME', 'RECURRING');

-- Recurrence cadence for a recurring transaction template
CREATE TYPE recurrence_interval AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- A group of users who share the same data. Never managed through the API - a migration
-- creates one and places accounts into it, the same way accounts themselves are
-- admin-created. Any account not explicitly grouped gets its own private household.
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT
);

-- Accounts. No self-service signup - add one via a new Flyway migration.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    must_change_password BOOLEAN NOT NULL DEFAULT false, -- forces a change on next login
    household_id UUID NOT NULL REFERENCES households(id)
);

-- categories/investments/recurring_transactions/transactions/saving_goals are scoped by
-- household_id (shared within a household), not user_id. user_id stays on each row as
-- provenance (who actually added it) but is no longer the authorization key. settings is
-- the one exception - it stays personal to each user (display name isn't shared).
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    household_id UUID NOT NULL REFERENCES households(id),
    name TEXT NOT NULL,
    monthly_budget NUMERIC(12,2) -- optional per-category spending limit
);

-- Recurring transactions template
CREATE TABLE recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    household_id UUID NOT NULL REFERENCES households(id),
    type transaction_type NOT NULL,
    frequency transaction_frequency NOT NULL DEFAULT 'RECURRING',
    recurrence_interval recurrence_interval NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,   -- first occurrence
    end_date DATE,              -- optional, last occurrence
    active BOOLEAN DEFAULT TRUE -- cancel future occurrences
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    household_id UUID NOT NULL REFERENCES households(id),
    recurring_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    frequency transaction_frequency NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    date DATE NOT NULL,
    description TEXT
);

CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    household_id UUID NOT NULL REFERENCES households(id),
    type TEXT NOT NULL, -- e.g., 'ETF', 'Stock', 'Crypto'
    ticker TEXT,        -- optional for automatic sync
    quantity NUMERIC(18, 8), -- units held; needed alongside ticker for price sync
    amount_invested NUMERIC(12, 2) NOT NULL,
    current_value NUMERIC(12, 2) NOT NULL,
    start_date DATE NOT NULL,
    notes TEXT,
    last_synced TIMESTAMP
);

CREATE TABLE saving_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    household_id UUID NOT NULL REFERENCES households(id),
    name TEXT NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL,
    current_amount NUMERIC(12, 2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE
);

-- One row per user (not per household - display name stays personal), created lazily on
-- that user's first GET /api/settings.
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    display_name TEXT NOT NULL
);

CREATE UNIQUE INDEX unique_username ON users (LOWER(username));
CREATE UNIQUE INDEX unique_category_name ON categories (household_id, LOWER(name));

-- Indexes for filtering
CREATE INDEX idx_transaction_date ON transactions(date);
CREATE INDEX idx_transaction_category ON transactions(category_id);
CREATE INDEX idx_transaction_type ON transactions(type);
CREATE INDEX idx_categories_household ON categories(household_id);
CREATE INDEX idx_investments_household ON investments(household_id);
CREATE INDEX idx_recurring_transactions_household ON recurring_transactions(household_id);
CREATE INDEX idx_transactions_household ON transactions(household_id);
CREATE INDEX idx_saving_goals_household ON saving_goals(household_id);
