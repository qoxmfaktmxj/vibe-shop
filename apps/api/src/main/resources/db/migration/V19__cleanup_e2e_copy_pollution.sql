UPDATE admin_display_settings
SET hero_title = '지금 머무는 공간에 어울리는 새로운 셀렉션',
    hero_cta_label = '컬렉션 보기',
    hero_cta_href = '/search',
    updated_at = NOW()
WHERE id = 1
  AND hero_title LIKE 'Ops Edit %';

DELETE FROM display_items
WHERE title LIKE 'Campaign %'
   OR subtitle = 'Created from Playwright.'
   OR cta_label = 'Open campaign';

DELETE FROM categories
WHERE slug LIKE 'objects-%'
   OR name LIKE 'Objects %'
   OR description = 'Category created from Playwright.'
   OR hero_subtitle = 'Category subtitle from Playwright.';

UPDATE categories
SET cover_image_alt = CASE slug
        WHEN 'living' THEN '리빙 카테고리 커버 이미지'
        WHEN 'kitchen' THEN '키친 카테고리 커버 이미지'
        WHEN 'wellness' THEN '웰니스 카테고리 커버 이미지'
        ELSE cover_image_alt
    END,
    hero_title = CASE slug
        WHEN 'living' THEN '공간을 정리하는 리빙 셀렉션'
        WHEN 'kitchen' THEN '테이블과 조리를 위한 키친 셀렉션'
        WHEN 'wellness' THEN '휴식과 루틴을 위한 웰니스 셀렉션'
        ELSE hero_title
    END,
    hero_subtitle = CASE slug
        WHEN 'living' THEN '소재와 질감이 살아 있는 정리, 침실, 거실 아이템을 차분하게 둘러보세요.'
        WHEN 'kitchen' THEN '플레이팅과 조리 동선에 맞춘 실용적인 도구와 식기를 한 번에 살펴보세요.'
        WHEN 'wellness' THEN '휴식과 셀프 케어 루틴에 어울리는 아이템을 한곳에 모았습니다.'
        ELSE hero_subtitle
    END
WHERE slug IN ('living', 'kitchen', 'wellness');
