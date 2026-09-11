-- Transaction type: income or expense
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE');

-- Transaction frequency: recurring or one-time
CREATE TYPE transaction_frequency AS ENUM ('ONE_TIME', 'RECURRING');

-- Recurrence cadence for a recurring transaction template
CREATE TYPE recurrence_interval AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL
);

-- Recurring transactions template
CREATE TABLE recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    name TEXT NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL,
    current_amount NUMERIC(12, 2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE
);

CREATE UNIQUE INDEX unique_category_name ON categories (LOWER(name));

-- Indexes for filtering
CREATE INDEX idx_transaction_date ON transactions(date);
CREATE INDEX idx_transaction_category ON transactions(category_id);
CREATE INDEX idx_transaction_type ON transactions(type);
