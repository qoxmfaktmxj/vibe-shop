UPDATE categories
SET slug = 'living',
    name = '리빙',
    description = '공간을 더 편안하게 만드는 생활 아이템',
    accent_color = '#5f5549',
    display_order = 10,
    is_visible = TRUE,
    cover_image_url = '/images/products/living-01.jpg',
    cover_image_alt = '리빙 카테고리 커버 이미지',
    hero_title = '공간을 정리하는 리빙 셀렉션',
    hero_subtitle = '소재와 질감이 살아 있는 거실과 침실 아이템을 차분하게 둘러보세요.'
WHERE slug LIKE 'objet-%'
   OR slug LIKE 'objects-%'
   OR description = '브라우저 테스트에서 생성한 임시 카테고리입니다.';
