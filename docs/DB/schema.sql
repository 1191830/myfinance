-- Transaction type: income or expense
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE');

-- Transaction frequency: recurring or one-time
CREATE TYPE transaction_frequency AS ENUM ('ONE_TIME', 'RECURRING');

-- Recurrence cadence for a recurring transaction template
CREATE TYPE recurrence_interval AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- Accounts. No self-service signup - add one via a new Flyway migration.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    monthly_budget NUMERIC(12,2) -- optional per-category spending limit
);

-- Recurring transactions template
CREATE TABLE recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
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
    type TEXT NOT NULL, -- e.g., 'ETF', 'Stock', 'Crypto'
    ticker TEXT,        -- optional for automatic sync
    amount_invested NUMERIC(12, 2) NOT NULL,
    current_value NUMERIC(12, 2) NOT NULL,
    start_date DATE NOT NULL,
    notes TEXT,
    last_synced TIMESTAMP
);

CREATE TABLE saving_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL,
    current_amount NUMERIC(12, 2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE
);

-- One row per user, created lazily on that user's first GET /api/settings.
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    display_name TEXT NOT NULL
);

CREATE UNIQUE INDEX unique_username ON users (LOWER(username));
CREATE UNIQUE INDEX unique_category_name ON categories (user_id, LOWER(name));

-- Indexes for filtering
CREATE INDEX idx_transaction_date ON transactions(date);
CREATE INDEX idx_transaction_category ON transactions(category_id);
CREATE INDEX idx_transaction_type ON transactions(type);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_investments_user ON investments(user_id);
CREATE INDEX idx_recurring_transactions_user ON recurring_transactions(user_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_saving_goals_user ON saving_goals(user_id);
