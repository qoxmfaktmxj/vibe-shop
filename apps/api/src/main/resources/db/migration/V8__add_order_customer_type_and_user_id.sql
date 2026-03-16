ALTER TABLE customer_orders
ADD COLUMN customer_type VARCHAR(20);

UPDATE customer_orders
SET customer_type = 'GUEST'
WHERE customer_type IS NULL;

ALTER TABLE customer_orders
ALTER COLUMN customer_type SET NOT NULL;

ALTER TABLE customer_orders
ADD COLUMN user_id BIGINT REFERENCES users (id);

CREATE INDEX customer_orders_user_id_idx ON customer_orders (user_id, created_at DESC);
