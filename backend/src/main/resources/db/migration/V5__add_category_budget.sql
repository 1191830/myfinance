-- V5__add_category_budget.sql

ALTER TABLE categories ADD COLUMN monthly_budget NUMERIC(12,2);
