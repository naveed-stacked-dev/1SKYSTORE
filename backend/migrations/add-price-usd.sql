-- Adds the USD selling price to products.
-- Run this on the database BEFORE deploying the code that uses price_usd:
-- every product query selects this column and fails until it exists.
-- The index on price_usd is created automatically by sequelize.sync() on startup.

ALTER TABLE products
  ADD COLUMN price_usd DECIMAL(10, 2) NOT NULL DEFAULT 0 COMMENT 'Selling price (store currency is USD)' AFTER price_inr;
