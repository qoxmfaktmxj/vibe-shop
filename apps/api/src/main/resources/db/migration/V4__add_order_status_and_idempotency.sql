ALTER TABLE customer_orders
ADD COLUMN idempotency_key VARCHAR(64);

UPDATE customer_orders
SET idempotency_key = 'legacy-' || order_number
WHERE idempotency_key IS NULL;

ALTER TABLE customer_orders
ALTER COLUMN idempotency_key SET NOT NULL;

ALTER TABLE customer_orders
ADD CONSTRAINT customer_orders_idempotency_key_uk UNIQUE (idempotency_key);

ALTER TABLE customer_orders
ADD COLUMN status VARCHAR(30);

UPDATE customer_orders
SET status = 'RECEIVED'
WHERE status IS NULL;

ALTER TABLE customer_orders
ALTER COLUMN status SET NOT NULL;
