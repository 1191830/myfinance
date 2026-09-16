-- V10__add_investment_current_price.sql
ALTER TABLE investments ADD COLUMN current_price NUMERIC(18, 8);
