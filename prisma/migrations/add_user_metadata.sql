-- Add metadata column to users table for magic link tokens
ALTER TABLE users ADD COLUMN metadata TEXT;
