CREATE TABLE product_reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    title VARCHAR(120) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT product_reviews_rating_range CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT product_reviews_unique_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX product_reviews_product_status_created_idx
    ON product_reviews (product_id, status, created_at DESC);

CREATE INDEX product_reviews_user_created_idx
    ON product_reviews (user_id, created_at DESC);

CREATE TABLE wishlist_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT wishlist_items_unique_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX wishlist_items_user_created_idx
    ON wishlist_items (user_id, created_at DESC);
