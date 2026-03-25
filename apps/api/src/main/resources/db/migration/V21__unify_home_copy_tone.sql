UPDATE display_sections
SET title = CASE code
        WHEN 'HERO' THEN '메인 배너'
        WHEN 'FEATURED_CATEGORY' THEN '카테고리 셀렉션'
        WHEN 'CURATED_PICK' THEN '추천 상품'
        WHEN 'NEW_ARRIVALS' THEN '신상품'
        WHEN 'BEST_SELLERS' THEN '인기 상품'
        WHEN 'PROMOTION' THEN '기획전'
        ELSE title
    END,
    subtitle = CASE code
        WHEN 'HERO' THEN '메인 비주얼과 CTA를 함께 보여줍니다.'
        WHEN 'FEATURED_CATEGORY' THEN '운영 중인 주요 카테고리를 바로 살펴볼 수 있습니다.'
        WHEN 'CURATED_PICK' THEN '지금 보여주기 좋은 상품을 모아 보여줍니다.'
        WHEN 'NEW_ARRIVALS' THEN '최근 등록된 상품을 먼저 보여줍니다.'
        WHEN 'BEST_SELLERS' THEN '인기와 반응이 좋은 상품을 중심으로 구성합니다.'
        WHEN 'PROMOTION' THEN '기획전과 프로모션 링크를 함께 보여줍니다.'
        ELSE subtitle
    END,
    updated_at = NOW()
WHERE code IN ('HERO', 'FEATURED_CATEGORY', 'CURATED_PICK', 'NEW_ARRIVALS', 'BEST_SELLERS', 'PROMOTION');

UPDATE display_items
SET title = CASE href
        WHEN '/category/living' THEN '리빙 큐레이션'
        WHEN '/category/kitchen' THEN '키친 큐레이션'
        WHEN '/category/wellness' THEN '웰니스 큐레이션'
        ELSE title
    END,
    subtitle = CASE href
        WHEN '/category/living' THEN '침실과 거실의 분위기를 차분하게 바꾸는 홈 스타일'
        WHEN '/category/kitchen' THEN '식기와 플레이팅 제품을 한곳에 모은 큐레이션'
        WHEN '/category/wellness' THEN '휴식과 셀프 케어 루틴에 어울리는 아이템 제안'
        ELSE subtitle
    END,
    image_alt = CASE href
        WHEN '/category/living' THEN '리빙 큐레이션 배너 이미지'
        WHEN '/category/kitchen' THEN '키친 큐레이션 배너 이미지'
        WHEN '/category/wellness' THEN '웰니스 큐레이션 배너 이미지'
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
