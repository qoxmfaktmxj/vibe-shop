UPDATE admin_display_settings
SET hero_title = '지금 머무는 공간에 어울리는 새로운 셀렉션',
    hero_subtitle = '운영자가 직접 수정한 메인 카피입니다.',
    hero_cta_label = '컬렉션 보기',
    hero_cta_href = '/search',
    updated_at = NOW()
WHERE id = 1;

UPDATE categories
SET slug = 'living',
    name = '리빙',
    description = '공간을 더 편안하게 만드는 생활 아이템',
    accent_color = '#ff8d6b',
    display_order = 10,
    is_visible = TRUE,
    cover_image_url = '/images/products/living-01.jpg',
    cover_image_alt = '리빙 카테고리 커버 이미지',
    hero_title = '공간을 정리하는 리빙 셀렉션',
    hero_subtitle = '소재와 질감이 살아 있는 정리, 침실, 거실 아이템을 차분하게 둘러보세요.'
WHERE slug LIKE 'objet-%'
   OR slug LIKE 'objects-%';

UPDATE categories
SET name = '키친',
    description = '식탁과 조리 시간을 더 즐겁게 하는 키친 아이템',
    accent_color = '#ffbf5f',
    display_order = 20,
    is_visible = TRUE,
    cover_image_url = '/images/products/kitchen-01.jpg',
    cover_image_alt = '키친 카테고리 커버 이미지',
    hero_title = '테이블과 조리를 위한 키친 셀렉션',
    hero_subtitle = '플레이팅과 조리 동선에 맞춘 실용적인 도구와 식기를 한 번에 살펴보세요.'
WHERE slug = 'kitchen';

UPDATE categories
SET name = '웰니스',
    description = '하루의 균형을 더하는 웰니스 아이템',
    accent_color = '#68b78e',
    display_order = 30,
    is_visible = TRUE,
    cover_image_url = '/images/products/wellness-01.jpg',
    cover_image_alt = '웰니스 카테고리 커버 이미지',
    hero_title = '휴식과 루틴을 위한 웰니스 셀렉션',
    hero_subtitle = '휴식과 셀프 케어 루틴에 어울리는 아이템을 한곳에 모았습니다.'
WHERE slug = 'wellness';

UPDATE display_sections
SET title = CASE code
        WHEN 'HERO' THEN '시즌 대표 배너'
        WHEN 'FEATURED_CATEGORY' THEN '카테고리 셀렉션'
        WHEN 'CURATED_PICK' THEN '큐레이션 픽'
        WHEN 'NEW_ARRIVALS' THEN '신상품 드롭'
        WHEN 'BEST_SELLERS' THEN '베스트셀러'
        WHEN 'PROMOTION' THEN '프로모션 배너'
        ELSE title
    END,
    subtitle = CASE code
        WHEN 'HERO' THEN '메인 비주얼과 CTA를 함께 노출합니다.'
        WHEN 'FEATURED_CATEGORY' THEN '운영 중인 주요 카테고리를 전면에서 소개합니다.'
        WHEN 'CURATED_PICK' THEN '지금 보여주고 싶은 추천 상품을 강조합니다.'
        WHEN 'NEW_ARRIVALS' THEN '최근 등록된 상품을 우선 노출합니다.'
        WHEN 'BEST_SELLERS' THEN '인기 점수가 높은 상품을 중심으로 구성합니다.'
        WHEN 'PROMOTION' THEN '기획전과 프로모션 링크를 하단 섹션에 노출합니다.'
        ELSE subtitle
    END,
    updated_at = NOW()
WHERE code IN ('HERO', 'FEATURED_CATEGORY', 'CURATED_PICK', 'NEW_ARRIVALS', 'BEST_SELLERS', 'PROMOTION');

DELETE FROM display_items
WHERE title LIKE '기획 배너 %'
   OR subtitle = '브라우저 테스트에서 생성한 임시 배너입니다.'
   OR image_alt LIKE '기획 배너 %';

UPDATE display_items
SET title = CASE href
        WHEN '/category/living' THEN '리빙 큐레이션'
        WHEN '/category/kitchen' THEN '키친 테이블웨어 위크'
        WHEN '/category/wellness' THEN '웰니스 루틴 큐레이션'
        ELSE title
    END,
    subtitle = CASE href
        WHEN '/category/living' THEN '침실과 거실의 분위기를 바꾸는 첫 번째 홈 스타일'
        WHEN '/category/kitchen' THEN '식기와 플레이팅 제품을 한데 모아보는 프로모션'
        WHEN '/category/wellness' THEN '휴식과 셀프 케어 루틴에 어울리는 아이템 제안'
        ELSE subtitle
    END,
    image_alt = CASE href
        WHEN '/category/living' THEN '리빙 큐레이션 배너 이미지'
        WHEN '/category/kitchen' THEN '키친 테이블웨어 위크 배너 이미지'
        WHEN '/category/wellness' THEN '웰니스 루틴 큐레이션 배너 이미지'
        ELSE image_alt
    END,
    cta_label = CASE href
        WHEN '/category/living' THEN '리빙 보기'
        WHEN '/category/kitchen' THEN '키친 보기'
        WHEN '/category/wellness' THEN '웰니스 보기'
        ELSE cta_label
    END,
    updated_at = NOW()
WHERE href IN ('/category/living', '/category/kitchen', '/category/wellness');

UPDATE products
SET name = CASE slug
        WHEN 'linen-bed-set' THEN '린넨 베드 세트'
        WHEN 'curve-floor-lamp' THEN '커브 플로어 램프'
        WHEN 'stone-plate-set' THEN '스톤 플레이트 4P'
        WHEN 'brew-mug' THEN '브루 머그'
        WHEN 'calm-aroma-oil' THEN '캄 아로마 오일'
        WHEN 'soft-robe' THEN '소프트 로브'
        ELSE name
    END,
    summary = CASE slug
        WHEN 'linen-bed-set' THEN '침실 분위기를 정돈해 주는 산뜻한 린넨 조합'
        WHEN 'curve-floor-lamp' THEN '공간에 부드러운 입체감을 더하는 플로어 램프'
        WHEN 'stone-plate-set' THEN '차분한 플레이팅에 어울리는 매트 플레이트 세트'
        WHEN 'brew-mug' THEN '매일 손이 가는 편안한 420ml 머그'
        WHEN 'calm-aroma-oil' THEN '저녁 시간을 편안하게 만드는 웰니스 오일'
        WHEN 'soft-robe' THEN '샤워 후 편안하게 걸치기 좋은 코튼 로브'
        ELSE summary
    END,
    description = CASE slug
        WHEN 'linen-bed-set' THEN '리넨, 스톤, 내추럴 톤을 중심으로 구성한 침실 세트입니다. 편안한 질감과 차분한 색감으로 침실을 정리하기 좋습니다.'
        WHEN 'curve-floor-lamp' THEN '곡선 실루엣과 은은한 조명으로 거실과 침실 코너를 따뜻하게 채워주는 램프입니다.'
        WHEN 'stone-plate-set' THEN '브런치와 일상 식탁에 활용하기 좋은 플레이트 4종 세트입니다. 자연스러운 질감과 실용적인 구성이 특징입니다.'
        WHEN 'brew-mug' THEN '부드러운 곡선과 안정적인 그립감으로 커피와 차를 즐기기 좋은 데일리 머그입니다.'
        WHEN 'calm-aroma-oil' THEN '은은한 향으로 휴식 루틴을 채우는 아로마 오일입니다. 디퓨저나 손목 등 다양한 방식으로 활용할 수 있습니다.'
        WHEN 'soft-robe' THEN '가벼운 착용감과 부드러운 터치감을 살린 데일리 로브입니다. 홈웨어나 스파 후 착용하기 좋습니다.'
        ELSE description
    END,
    image_alt = CASE slug
        WHEN 'linen-bed-set' THEN '린넨 베드 세트 상품 이미지'
        WHEN 'curve-floor-lamp' THEN '커브 플로어 램프 상품 이미지'
        WHEN 'stone-plate-set' THEN '스톤 플레이트 4P 상품 이미지'
        WHEN 'brew-mug' THEN '브루 머그 상품 이미지'
        WHEN 'calm-aroma-oil' THEN '캄 아로마 오일 상품 이미지'
        WHEN 'soft-robe' THEN '소프트 로브 상품 이미지'
        ELSE image_alt
    END
WHERE slug IN (
    'linen-bed-set',
    'curve-floor-lamp',
    'stone-plate-set',
    'brew-mug',
    'calm-aroma-oil',
    'soft-robe'
);
