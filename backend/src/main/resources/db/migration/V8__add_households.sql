-- V8__add_households.sql

-- ===============================
-- Households
-- ===============================
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT
);

ALTER TABLE users ADD COLUMN household_id UUID REFERENCES households(id);

-- One shared household for rui + rita. rita is a new account, same placeholder-password
-- convention as rui's original seed (V6): bcrypt of "changeme123", forced change on first
-- login.
INSERT INTO households (id, name) VALUES ('12a20df9-ed46-4985-b9ef-ea96c1486b1f', 'Família');

UPDATE users SET household_id = '12a20df9-ed46-4985-b9ef-ea96c1486b1f' WHERE username = 'rui';

INSERT INTO users (username, password_hash, must_change_password, household_id)
VALUES ('rita', '$2a$10$9womBiZHhqMHMdvUWLqqdugr4yqtejaFnrhLy2FgLRYg0uy/DIPaa', true,
        '12a20df9-ed46-4985-b9ef-ea96c1486b1f');

ALTER TABLE users ALTER COLUMN household_id SET NOT NULL;

-- ===============================
-- Every shared resource moves from per-user to per-household scoping. Settings is
-- deliberately excluded - display name stays personal to each user.
-- ===============================
ALTER TABLE categories ADD COLUMN household_id UUID REFERENCES households(id);
ALTER TABLE investments ADD COLUMN household_id UUID REFERENCES households(id);
ALTER TABLE recurring_transactions ADD COLUMN household_id UUID REFERENCES households(id);
ALTER TABLE transactions ADD COLUMN household_id UUID REFERENCES households(id);
ALTER TABLE saving_goals ADD COLUMN household_id UUID REFERENCES households(id);

UPDATE categories c SET household_id = u.household_id FROM users u WHERE c.user_id = u.id;
UPDATE investments i SET household_id = u.household_id FROM users u WHERE i.user_id = u.id;
UPDATE recurring_transactions r SET household_id = u.household_id FROM users u WHERE r.user_id = u.id;
UPDATE transactions t SET household_id = u.household_id FROM users u WHERE t.user_id = u.id;
UPDATE saving_goals s SET household_id = u.household_id FROM users u WHERE s.user_id = u.id;

ALTER TABLE categories ALTER COLUMN household_id SET NOT NULL;
ALTER TABLE investments ALTER COLUMN household_id SET NOT NULL;
ALTER TABLE recurring_transactions ALTER COLUMN household_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN household_id SET NOT NULL;
ALTER TABLE saving_goals ALTER COLUMN household_id SET NOT NULL;

CREATE INDEX idx_categories_household ON categories(household_id);
CREATE INDEX idx_investments_household ON investments(household_id);
CREATE INDEX idx_recurring_transactions_household ON recurring_transactions(household_id);
CREATE INDEX idx_transactions_household ON transactions(household_id);
CREATE INDEX idx_saving_goals_household ON saving_goals(household_id);

-- Category names are unique per household now, not per user - rui and rita share one list.
DROP INDEX unique_category_name;
CREATE UNIQUE INDEX unique_category_name ON categories (household_id, LOWER(name));
