-- V4__add_settings.sql

CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name TEXT NOT NULL
);

-- Single-user app: exactly one settings row always exists.
INSERT INTO settings (display_name) VALUES ('Rui Marques');
