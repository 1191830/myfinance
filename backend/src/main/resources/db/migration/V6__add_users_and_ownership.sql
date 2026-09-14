-- V6__add_users_and_ownership.sql

-- ===============================
-- Users
-- ===============================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX unique_username ON users (LOWER(username));

-- Seed user: everything that existed before multi-user support becomes this user's data.
-- Password is a placeholder ("changeme123") - change it after first login (see README).
INSERT INTO users (username, password_hash)
VALUES ('rui', '$2a$10$9womBiZHhqMHMdvUWLqqdugr4yqtejaFnrhLy2FgLRYg0uy/DIPaa');

-- ===============================
-- Ownership columns
-- ===============================
ALTER TABLE categories ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE investments ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE recurring_transactions ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE transactions ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE saving_goals ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE settings ADD COLUMN user_id UUID REFERENCES users(id);

UPDATE categories SET user_id = (SELECT id FROM users WHERE username = 'rui');
UPDATE investments SET user_id = (SELECT id FROM users WHERE username = 'rui');
UPDATE recurring_transactions SET user_id = (SELECT id FROM users WHERE username = 'rui');
UPDATE transactions SET user_id = (SELECT id FROM users WHERE username = 'rui');
UPDATE saving_goals SET user_id = (SELECT id FROM users WHERE username = 'rui');
UPDATE settings SET user_id = (SELECT id FROM users WHERE username = 'rui');

ALTER TABLE categories ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE investments ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE recurring_transactions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE saving_goals ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE settings ALTER COLUMN user_id SET NOT NULL;

CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_investments_user ON investments(user_id);
CREATE INDEX idx_recurring_transactions_user ON recurring_transactions(user_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_saving_goals_user ON saving_goals(user_id);
CREATE UNIQUE INDEX unique_settings_user ON settings(user_id);

-- Category names are unique per user now, not globally.
DROP INDEX unique_category_name;
CREATE UNIQUE INDEX unique_category_name ON categories (user_id, LOWER(name));
