WITH ranked_products AS (
    SELECT
        product.id,
        category.slug AS category_slug,
        ROW_NUMBER() OVER (
            PARTITION BY category.slug
            ORDER BY product.id ASC
        ) AS image_rank
    FROM products product
    JOIN categories category ON category.id = product.category_id
    WHERE category.slug IN ('living', 'kitchen', 'wellness')
)
UPDATE products product
SET image_url = '/images/products/' || ranked_products.category_slug || '-' || LPAD((((ranked_products.image_rank - 1) % 100) + 1)::TEXT, 2, '0') || '.jpg',
    image_alt = COALESCE(NULLIF(product.image_alt, ''), product.name || ' 상품 이미지')
FROM ranked_products
WHERE product.id = ranked_products.id;

WITH ranked_review_images AS (
    SELECT
        review_image.id,
        category.slug AS category_slug,
        ROW_NUMBER() OVER (
            PARTITION BY category.slug
            ORDER BY review_image.review_id ASC, review_image.display_order ASC, review_image.id ASC
        ) AS image_rank
    FROM review_images review_image
    JOIN product_reviews review ON review.id = review_image.review_id
    JOIN products product ON product.id = review.product_id
    JOIN categories category ON category.id = product.category_id
    WHERE category.slug IN ('living', 'kitchen', 'wellness')
)
UPDATE review_images review_image
SET image_url = '/images/products/' || ranked_review_images.category_slug || '-' || LPAD((((ranked_review_images.image_rank - 1) % 100) + 1)::TEXT, 2, '0') || '.jpg'
FROM ranked_review_images
WHERE review_image.id = ranked_review_images.id;
