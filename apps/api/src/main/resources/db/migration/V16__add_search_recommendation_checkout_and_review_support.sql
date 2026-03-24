ALTER TABLE products
ADD COLUMN color VARCHAR(40),
ADD COLUMN season_tag VARCHAR(40),
ADD COLUMN use_case_tag VARCHAR(60),
ADD COLUMN gender_tag VARCHAR(20),
ADD COLUMN material_tag VARCHAR(60),
ADD COLUMN search_keywords TEXT;

CREATE INDEX products_category_price_idx
    ON products (category_id, price ASC, id ASC);

CREATE INDEX products_color_idx
    ON products (color);

CREATE INDEX products_season_tag_idx
    ON products (season_tag);

CREATE INDEX products_use_case_tag_idx
    ON products (use_case_tag);

ALTER TABLE customer_orders
ADD COLUMN customer_email VARCHAR(120),
ADD COLUMN suspicious_flag BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN suspicious_reason VARCHAR(255);

CREATE INDEX customer_orders_created_at_status_idx
    ON customer_orders (created_at DESC, status);

CREATE INDEX customer_orders_phone_created_at_idx
    ON customer_orders (phone, created_at DESC);

CREATE INDEX customer_orders_suspicious_flag_idx
    ON customer_orders (suspicious_flag, created_at DESC);

CREATE TABLE product_view_events (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users (id) ON DELETE CASCADE,
    visitor_key VARCHAR(64),
    source VARCHAR(40) NOT NULL DEFAULT 'PRODUCT_DETAIL',
    viewed_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX product_view_events_product_viewed_idx
    ON product_view_events (product_id, viewed_at DESC);

CREATE INDEX product_view_events_user_viewed_idx
    ON product_view_events (user_id, viewed_at DESC)
    WHERE user_id IS NOT NULL;

CREATE INDEX product_view_events_visitor_viewed_idx
    ON product_view_events (visitor_key, viewed_at DESC)
    WHERE visitor_key IS NOT NULL;

ALTER TABLE product_reviews
ADD COLUMN fit_tag VARCHAR(40),
ADD COLUMN repurchase_yn BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN delivery_satisfaction SMALLINT,
ADD COLUMN packaging_satisfaction SMALLINT,
ADD COLUMN helpful_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN is_buyer_review BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE product_reviews
ADD CONSTRAINT product_reviews_delivery_satisfaction_range
    CHECK (delivery_satisfaction IS NULL OR delivery_satisfaction BETWEEN 1 AND 5);

ALTER TABLE product_reviews
ADD CONSTRAINT product_reviews_packaging_satisfaction_range
    CHECK (packaging_satisfaction IS NULL OR packaging_satisfaction BETWEEN 1 AND 5);

CREATE INDEX product_reviews_product_rating_created_idx
    ON product_reviews (product_id, rating DESC, created_at DESC);

CREATE INDEX product_reviews_product_helpful_created_idx
    ON product_reviews (product_id, helpful_count DESC, created_at DESC);

CREATE TABLE review_images (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES product_reviews (id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX review_images_review_order_idx
    ON review_images (review_id, display_order ASC, id ASC);

CREATE TABLE review_helpful_votes (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES product_reviews (id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT review_helpful_votes_unique_review_user UNIQUE (review_id, user_id)
);

CREATE INDEX review_helpful_votes_user_created_idx
    ON review_helpful_votes (user_id, created_at DESC);

UPDATE products
SET
    color = CASE
        WHEN slug LIKE '%black%' THEN 'black'
        WHEN slug LIKE '%white%' OR slug LIKE '%cream%' THEN 'white'
        WHEN slug LIKE '%sage%' OR slug LIKE '%green%' THEN 'green'
        WHEN slug LIKE '%beige%' OR slug LIKE '%linen%' THEN 'beige'
        ELSE color
    END,
    season_tag = CASE
        WHEN slug LIKE '%robe%' OR slug LIKE '%aroma%' THEN 'all_season'
        WHEN slug LIKE '%linen%' THEN 'summer'
        ELSE COALESCE(season_tag, 'all_season')
    END,
    use_case_tag = CASE
        WHEN slug LIKE '%bed%' OR slug LIKE '%lamp%' THEN 'daily,home'
        WHEN slug LIKE '%plate%' OR slug LIKE '%mug%' THEN 'gift,daily,dining'
        WHEN slug LIKE '%aroma%' OR slug LIKE '%robe%' THEN 'gift,relax,wellness'
        ELSE COALESCE(use_case_tag, 'daily')
    END,
    gender_tag = COALESCE(gender_tag, 'unisex'),
    material_tag = CASE
        WHEN slug LIKE '%linen%' THEN 'linen'
        WHEN slug LIKE '%robe%' THEN 'cotton'
        WHEN slug LIKE '%mug%' OR slug LIKE '%plate%' THEN 'ceramic'
        ELSE material_tag
    END,
    search_keywords = concat_ws(', ', name, summary, description, badge, slug, category_id::text)
WHERE search_keywords IS NULL
   OR color IS NULL
   OR season_tag IS NULL
   OR use_case_tag IS NULL
   OR gender_tag IS NULL;
