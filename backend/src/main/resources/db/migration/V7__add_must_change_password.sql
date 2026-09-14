-- V7__add_must_change_password.sql

ALTER TABLE users ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT false;

-- The seeded account still has its placeholder password (see V6) - force a change on
-- next login.
UPDATE users SET must_change_password = true WHERE username = 'rui';
