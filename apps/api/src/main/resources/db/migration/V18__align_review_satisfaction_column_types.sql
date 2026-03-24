ALTER TABLE product_reviews
    ALTER COLUMN delivery_satisfaction TYPE INTEGER USING delivery_satisfaction::INTEGER,
    ALTER COLUMN packaging_satisfaction TYPE INTEGER USING packaging_satisfaction::INTEGER;
