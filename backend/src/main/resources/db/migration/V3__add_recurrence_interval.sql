-- V3__add_recurrence_interval.sql

CREATE TYPE recurrence_interval AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- Backfill the existing (monthly-cadence) seeded templates, then drop the default so new
-- rows must specify it explicitly.
ALTER TABLE recurring_transactions
    ADD COLUMN recurrence_interval recurrence_interval NOT NULL DEFAULT 'MONTHLY';

ALTER TABLE recurring_transactions ALTER COLUMN recurrence_interval DROP DEFAULT;
