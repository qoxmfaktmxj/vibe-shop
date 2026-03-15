UPDATE categories
SET description = CASE slug
    WHEN 'living' THEN '차분한 공간을 완성하는 리빙 셀렉션'
    WHEN 'kitchen' THEN '식탁과 조리 시간을 정돈하는 키친 셀렉션'
    WHEN 'wellness' THEN '하루의 균형을 더하는 웰니스 셀렉션'
    ELSE description
END
WHERE slug IN ('living', 'kitchen', 'wellness');

UPDATE products
SET summary = CASE slug
    WHEN 'linen-bed-set' THEN '침실 분위기를 정돈해 주는 산뜻한 린넨 조합'
    WHEN 'curve-floor-lamp' THEN '공간에 부드러운 입체감을 더하는 플로어 램프'
    WHEN 'stone-plate-set' THEN '차분한 플레이팅에 어울리는 매트 플레이트 세트'
    WHEN 'brew-mug' THEN '일상에 편안하게 스며드는 세라믹 머그'
    WHEN 'calm-aroma-oil' THEN '저녁 시간에 어울리는 우디 플로럴 아로마 오일'
    WHEN 'soft-robe' THEN '샤워 후 편안하게 걸치기 좋은 코튼 로브'
    ELSE summary
END,
description = CASE slug
    WHEN 'linen-bed-set' THEN '크림, 스톤, 세이지 세 가지 톤으로 구성한 침구 세트입니다. 가볍고 부드러운 촉감으로 계절에 오래 머무르며 침실 분위기를 단정하게 정리해 줍니다.'
    WHEN 'curve-floor-lamp' THEN '소파 옆이나 침실 한편에 두기 좋은 플로어 램프입니다. 부드럽게 퍼지는 광량과 유연한 곡선 실루엣으로 공간의 인상을 차분하게 바꿔 줍니다.'
    WHEN 'stone-plate-set' THEN '브런치, 디저트, 간단한 메인 요리까지 자연스럽게 담아낼 수 있는 플레이트 세트입니다. 은은한 매트 텍스처가 식탁 위 분위기를 정돈해 줍니다.'
    WHEN 'brew-mug' THEN '손에 안정적으로 잡히는 곡선 손잡이와 적당한 두께감이 특징인 머그입니다. 매일 사용하는 식기만으로도 루틴의 밀도를 바꿀 수 있도록 구성했습니다.'
    WHEN 'calm-aroma-oil' THEN '호흡을 천천히 가다듬고 공간의 긴장을 낮추는 데 초점을 둔 아로마 오일입니다. 우디 플로럴 향이 잔잔하게 퍼지며 저녁 시간을 편안하게 만들어 줍니다.'
    WHEN 'soft-robe' THEN '집 안에서 부담 없이 걸칠 수 있는 미니멀한 로브입니다. 가벼운 코튼 소재와 여유로운 실루엣으로 하루의 쉼을 편안하게 이어 줍니다.'
    ELSE description
END
WHERE slug IN (
    'linen-bed-set',
    'curve-floor-lamp',
    'stone-plate-set',
    'brew-mug',
    'calm-aroma-oil',
    'soft-robe'
);
