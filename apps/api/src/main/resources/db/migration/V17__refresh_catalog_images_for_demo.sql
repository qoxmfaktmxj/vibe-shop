UPDATE products p
SET image_url = CASE c.slug
    WHEN 'living' THEN 'https://loremflickr.com/1200/1600/living-room?lock=' || (1000 + p.id)
    WHEN 'kitchen' THEN 'https://loremflickr.com/1200/1600/kitchen?lock=' || (2000 + p.id)
    WHEN 'wellness' THEN 'https://loremflickr.com/1200/1600/spa?lock=' || (3000 + p.id)
    ELSE p.image_url
END,
image_alt = CASE c.slug
    WHEN 'living' THEN p.name || ' 라이프스타일 이미지'
    WHEN 'kitchen' THEN p.name || ' 키친 상품 이미지'
    WHEN 'wellness' THEN p.name || ' 웰니스 상품 이미지'
    ELSE p.image_alt
END
FROM categories c
WHERE p.category_id = c.id;

UPDATE categories
SET cover_image_url = CASE slug
    WHEN 'living' THEN 'https://loremflickr.com/1600/1200/interior?lock=4101'
    WHEN 'kitchen' THEN 'https://loremflickr.com/1600/1200/kitchen?lock=4102'
    WHEN 'wellness' THEN 'https://loremflickr.com/1600/1200/wellness?lock=4103'
    ELSE cover_image_url
END,
cover_image_alt = CASE slug
    WHEN 'living' THEN '리빙 카테고리 커버 이미지'
    WHEN 'kitchen' THEN '키친 카테고리 커버 이미지'
    WHEN 'wellness' THEN '웰니스 카테고리 커버 이미지'
    ELSE cover_image_alt
END;
