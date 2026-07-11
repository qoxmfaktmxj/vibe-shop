UPDATE admin_display_settings
SET hero_title = '머무는 시간이 더 좋아지는 오브제',
    hero_subtitle = '좋은 소재와 편안한 형태로, 매일의 공간을 오래 사랑할 수 있게 합니다.',
    hero_cta_label = '컬렉션 보기',
    hero_cta_href = '/search',
    updated_at = NOW()
WHERE hero_title LIKE '운영 메인 카피 %'
   OR hero_title LIKE 'Ops Edit %'
   OR hero_subtitle = '운영자가 직접 수정한 메인 카피입니다.';

DELETE FROM display_items
WHERE title LIKE '기획 배너 %'
   OR subtitle = '브라우저 테스트에서 생성한 임시 배너입니다.'
   OR image_alt LIKE '기획 배너 %';

DELETE FROM categories category
WHERE (category.slug LIKE 'objet-%' OR category.slug LIKE 'objects-%')
  AND NOT EXISTS (
      SELECT 1
      FROM products product
      WHERE product.category_id = category.id
  );

UPDATE products product
SET name = CASE MOD(product.id, 8)
        WHEN 0 THEN '오크 사이드 오브제'
        WHEN 1 THEN '테라 린넨 라운지'
        WHEN 2 THEN '라운드 플로어 램프'
        WHEN 3 THEN '울 블렌드 스로우'
        WHEN 4 THEN '트래버틴 북엔드'
        WHEN 5 THEN '브론즈 테이블 램프'
        WHEN 6 THEN '캐시미어 쿠션'
        ELSE '리브드 세라믹 베이스'
    END,
    summary = '절제된 형태와 따뜻한 소재로 완성한 리빙 셀렉션',
    description = '편안한 비례와 오래 두고 볼 수 있는 마감을 중심으로 고른 마루의 리빙 오브제입니다.',
    badge = 'NEW',
    image_url = CASE MOD(product.id, 8)
        WHEN 0 THEN '/images/products/living-12.jpg'
        WHEN 1 THEN '/images/products/living-18.jpg'
        WHEN 2 THEN '/images/products/living-27.jpg'
        WHEN 3 THEN '/images/products/living-34.jpg'
        WHEN 4 THEN '/images/products/living-45.jpg'
        WHEN 5 THEN '/images/products/living-52.jpg'
        WHEN 6 THEN '/images/products/living-68.jpg'
        ELSE '/images/products/living-79.jpg'
    END,
    image_alt = '마루 리빙 셀렉션 라이프스타일 이미지',
    search_keywords = '리빙, 오브제, 홈, 선물, 인테리어, 마루'
WHERE product.slug LIKE 'demo-product-%';

UPDATE products product
SET summary = CASE category.slug
        WHEN 'living' THEN '공간에 온기와 균형을 더하는 리빙 셀렉션'
        WHEN 'kitchen' THEN '일상의 식탁을 단정하게 완성하는 키친 셀렉션'
        ELSE '느린 휴식과 편안한 루틴을 위한 웰니스 셀렉션'
    END,
    description = CASE category.slug
        WHEN 'living' THEN product.name || '은 편안한 형태와 자연스러운 소재감을 오래 즐길 수 있도록 고른 오브제입니다.'
        WHEN 'kitchen' THEN product.name || '은 손에 닿는 사용감과 차분한 테이블 분위기를 함께 고려한 생활 도구입니다.'
        ELSE product.name || '은 하루의 긴장을 덜고 아늑한 휴식 루틴을 만드는 데 어울리는 아이템입니다.'
    END,
    badge = CASE WHEN product.badge = 'DEMO' THEN 'ESSENTIAL' ELSE product.badge END,
    search_keywords = CONCAT_WS(', ', product.name, category.name, product.material_tag, product.use_case_tag, '마루 셀렉션')
FROM categories category
WHERE product.category_id = category.id
  AND (
      product.slug LIKE 'living-demo-%'
      OR product.slug LIKE 'kitchen-demo-%'
      OR product.slug LIKE 'wellness-demo-%'
  )
  AND (
      product.summary LIKE '%테스트용%'
      OR product.description LIKE '%테스트%'
      OR product.badge = 'DEMO'
  );

UPDATE product_reviews review
SET status = 'HIDDEN',
    updated_at = NOW()
FROM users user_account
WHERE review.user_id = user_account.id
  AND review.title LIKE 'Review %'
  AND user_account.email LIKE 'engagement-%@example.com';
