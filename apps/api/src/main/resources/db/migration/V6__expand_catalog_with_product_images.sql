ALTER TABLE products
    ADD COLUMN image_url VARCHAR(255) NOT NULL DEFAULT '/images/products/living-01.jpg',
    ADD COLUMN image_alt VARCHAR(255) NOT NULL DEFAULT '테스트 상품 이미지';

UPDATE products
SET image_url = CASE slug
    WHEN 'linen-bed-set' THEN '/images/products/living-01.jpg'
    WHEN 'curve-floor-lamp' THEN '/images/products/living-02.jpg'
    WHEN 'stone-plate-set' THEN '/images/products/kitchen-01.jpg'
    WHEN 'brew-mug' THEN '/images/products/kitchen-02.jpg'
    WHEN 'calm-aroma-oil' THEN '/images/products/wellness-01.jpg'
    WHEN 'soft-robe' THEN '/images/products/wellness-02.jpg'
END,
image_alt = CASE slug
    WHEN 'linen-bed-set' THEN '린넨 베드 세트 상품 이미지'
    WHEN 'curve-floor-lamp' THEN '커브 플로어 램프 상품 이미지'
    WHEN 'stone-plate-set' THEN '스톤 플레이트 4P 상품 이미지'
    WHEN 'brew-mug' THEN '브루 머그 상품 이미지'
    WHEN 'calm-aroma-oil' THEN '캄 아로마 오일 상품 이미지'
    WHEN 'soft-robe' THEN '소프트 로브 상품 이미지'
END
WHERE slug IN (
    'linen-bed-set',
    'curve-floor-lamp',
    'stone-plate-set',
    'brew-mug',
    'calm-aroma-oil',
    'soft-robe'
);

INSERT INTO products (
    category_id,
    slug,
    name,
    summary,
    description,
    price,
    badge,
    accent_color,
    featured,
    stock,
    image_url,
    image_alt
) VALUES
((SELECT id FROM categories WHERE slug = 'living'), 'boucle-lounge-chair', '부클 라운지 체어', '폭신한 텍스처로 휴식 각도를 만드는 라운지 체어', '둥근 등받이와 부클 패브릭이 특징인 라운지 체어입니다. 독서 코너나 침실 한쪽에 두기 좋은 리빙 포인트 제품입니다.', 248000, 'CURVE', '#6d597a', FALSE, 9, '/images/products/living-03.jpg', '부클 라운지 체어 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'living'), 'modular-side-table', '모듈 사이드 테이블', '낮은 실루엣으로 공간 균형을 잡는 사이드 테이블', '컵, 책, 디퓨저를 올려두기 좋은 높이의 사이드 테이블입니다. 미니멀한 구조라 다양한 좌석 옆에 자연스럽게 어울립니다.', 98000, 'FORM', '#7f5539', FALSE, 15, '/images/products/living-04.jpg', '모듈 사이드 테이블 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'living'), 'cloud-sofa-throw', '클라우드 소파 스로우', '소파 톤을 차분하게 눌러주는 라이트 스로우', '느슨한 짜임과 매트한 촉감으로 계절 전환기에 활용하기 좋은 소파 스로우입니다. 리빙 장면에 가벼운 층을 더해 줍니다.', 39000, 'SOFT', '#8d99ae', FALSE, 35, '/images/products/living-01.jpg', '클라우드 소파 스로우 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'living'), 'arch-wall-mirror', '아치 월 미러', '벽면 리듬을 만들어 주는 아치형 거울', '세로로 긴 비율의 아치형 거울입니다. 현관과 드레스룸, 침실 코너에서 공간을 밝게 확장하는 데 적합합니다.', 149000, 'LIGHT', '#b56576', FALSE, 7, '/images/products/living-02.jpg', '아치 월 미러 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'living'), 'cedar-storage-bench', '시더 수납 벤치', '입구와 침실에 함께 쓰는 낮은 수납 벤치', '좌판 아래 수납 공간이 들어 있는 벤치입니다. 러그, 슬리퍼, 잡지를 정리하면서 앉는 기능까지 함께 제공합니다.', 178000, 'DUAL', '#7f4f24', FALSE, 6, '/images/products/living-03.jpg', '시더 수납 벤치 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'living'), 'stone-incense-holder', '스톤 인센스 홀더', '작은 오브제로 마무리하는 스톤 홀더', '무광 질감의 스톤 인센스 홀더입니다. 리빙 선반이나 침대 옆 협탁 위에 두기 좋은 작은 사이즈입니다.', 22000, 'CALM', '#84a59d', FALSE, 41, '/images/products/living-04.jpg', '스톤 인센스 홀더 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'living'), 'oak-magazine-rack', '오크 매거진 랙', '책과 잡지를 세워두는 슬림 우드 랙', '잡지와 얇은 북을 정리하기 좋은 우드 매거진 랙입니다. 리빙룸의 시선이 머무는 위치에 배치해도 부담이 없습니다.', 64000, 'WOOD', '#6b705c', FALSE, 18, '/images/products/living-01.jpg', '오크 매거진 랙 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'living'), 'pleated-floor-cushion', '플리츠 플로어 쿠션', '바닥 좌석에도 리듬을 더하는 플리츠 쿠션', '낮은 테이블과 함께 쓰기 좋은 플로어 쿠션입니다. 플리츠 표면으로 단조롭지 않은 텍스처를 더합니다.', 47000, 'REST', '#9c6644', FALSE, 22, '/images/products/living-02.jpg', '플리츠 플로어 쿠션 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'living'), 'moon-table-lamp', '문 테이블 램프', '침실과 거실을 잇는 둥근 조도 램프', '부드러운 확산광을 중심으로 설계된 테이블 램프입니다. 침실 협탁과 거실 콘솔 양쪽에 모두 잘 어울립니다.', 76000, 'GLOW', '#457b9d', FALSE, 16, '/images/products/living-03.jpg', '문 테이블 램프 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'living'), 'ripple-vase-set', '리플 베이스 세트', '꽃이 없어도 장면이 완성되는 유리 화병 세트', '높이가 다른 두 개의 유리 화병으로 구성한 세트입니다. 꽃 없이 두어도 자연스러운 리빙 오브제가 됩니다.', 58000, 'PAIR', '#adb5bd', FALSE, 27, '/images/products/living-04.jpg', '리플 베이스 세트 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'living'), 'wool-area-rug', '울 에어리어 러그', '가구 비율을 정리해 주는 뉴트럴 러그', '낮은 채도의 울 블렌드 러그입니다. 소파와 테이블 사이 비율을 잡아 공간 중심을 만드는 데 적합합니다.', 189000, 'TEXTURE', '#bcb8b1', FALSE, 8, '/images/products/living-01.jpg', '울 에어리어 러그 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'living'), 'linen-room-spray', '리넨 룸 스프레이', '정돈된 공간 인상을 남기는 패브릭 스프레이', '침구와 커튼, 소파 패브릭에 가볍게 사용할 수 있는 룸 스프레이입니다. 비누와 우디 노트를 조합한 잔향이 특징입니다.', 26000, 'SCENT', '#588157', FALSE, 33, '/images/products/living-02.jpg', '리넨 룸 스프레이 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'living'), 'brass-candle-holder', '브라스 캔들 홀더', '선반 위에 작은 광택을 더하는 브라스 홀더', '가느다란 테이퍼 캔들에 맞춘 브라스 홀더입니다. 낮과 밤 모두 공간 인상을 세밀하게 바꾸는 소형 오브제입니다.', 32000, 'METAL', '#bc6c25', FALSE, 29, '/images/products/living-03.jpg', '브라스 캔들 홀더 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'living'), 'form-bookshelf', '폼 북쉘프', '낮은 높이로 여백을 남기는 모듈 북쉘프', '책과 오브제를 과하게 채우지 않고 정리하는 낮은 형태의 북쉘프입니다. 거실 벽면을 답답하지 않게 채우는 구조입니다.', 219000, 'SHELF', '#495057', FALSE, 5, '/images/products/living-04.jpg', '폼 북쉘프 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'living'), 'cotton-slipper-set', '코튼 슬리퍼 세트', '집 안 동선을 가볍게 만드는 코튼 슬리퍼', '거실과 침실을 오갈 때 쓰기 좋은 실내용 슬리퍼 세트입니다. 폭신한 밑창과 담백한 컬러 구성이 특징입니다.', 28000, 'DAILY', '#a98467', FALSE, 32, '/images/products/living-01.jpg', '코튼 슬리퍼 세트 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'living'), 'minimal-coat-stand', '미니멀 코트 스탠드', '입구에 수직선을 세우는 슬림 스탠드', '현관과 침실 한쪽에 세우기 좋은 메탈 코트 스탠드입니다. 옷과 가방을 동시에 걸어도 시각적으로 가볍습니다.', 112000, 'ENTRY', '#3a5a40', FALSE, 12, '/images/products/living-02.jpg', '미니멀 코트 스탠드 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'living'), 'ceramic-tray-duo', '세라믹 트레이 듀오', '작은 소품을 정리하는 낮은 세라믹 트레이', '향초, 열쇠, 액세서리를 올려두기 좋은 트레이 2종 세트입니다. 콘솔과 협탁 위 정리를 단정하게 도와줍니다.', 34000, 'DUO', '#9a8c98', FALSE, 26, '/images/products/living-03.jpg', '세라믹 트레이 듀오 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'living'), 'wall-clock-ivory', '아이보리 월 클락', '벽면에 부드러운 리듬을 남기는 무소음 시계', '얇은 프레임과 무소음 무브먼트를 적용한 벽시계입니다. 주방과 거실 경계에 두기 좋은 담백한 타입입니다.', 52000, 'TIME', '#c9ada7', FALSE, 20, '/images/products/living-04.jpg', '아이보리 월 클락 상품 이미지'),

((SELECT id FROM categories WHERE slug = 'kitchen'), 'oak-cutting-board', '오크 커팅 보드', '준비 시간을 정갈하게 만드는 우드 보드', '손잡이가 길게 빠진 오크 커팅 보드입니다. 재료 손질과 간단한 서빙을 한 판에서 이어가기 좋습니다.', 36000, 'PREP', '#7f5539', FALSE, 40, '/images/products/kitchen-03.jpg', '오크 커팅 보드 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'kitchen'), 'glazed-bowl-set', '글레이즈 볼 세트', '곡선 깊이가 다른 데일리 볼 3종 세트', '샐러드와 요거트, 국물 요리까지 폭넓게 쓰기 좋은 볼 세트입니다. 글레이즈 표면이 은은한 포인트를 줍니다.', 39000, 'SET', '#8d99ae', FALSE, 38, '/images/products/kitchen-04.jpg', '글레이즈 볼 세트 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'kitchen'), 'stainless-kettle', '스테인리스 케틀', '가벼운 추출 루틴을 위한 슬림 케틀', '핸드드립과 차 우리기에 모두 쓰기 좋은 얇은 주둥이의 케틀입니다. 상판 위에 두어도 매끈한 실루엣이 유지됩니다.', 68000, 'POUR', '#6c757d', FALSE, 19, '/images/products/kitchen-01.jpg', '스테인리스 케틀 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'kitchen'), 'linen-apron', '리넨 에이프런', '주방 동작을 편하게 감싸는 라이트 에이프런', '워싱 리넨 소재로 만든 조리용 에이프런입니다. 포켓과 길이 비율을 단순하게 정리해 움직임이 편합니다.', 32000, 'WEAR', '#b56576', FALSE, 45, '/images/products/kitchen-02.jpg', '리넨 에이프런 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'kitchen'), 'marble-trivet', '마블 트리벳', '뜨거운 냄비 아래 차분함을 남기는 스톤 받침', '냄비와 팬을 내려놓기 좋은 무게감 있는 트리벳입니다. 상판 표면을 보호하면서도 테이블 톤을 해치지 않습니다.', 28000, 'STONE', '#adb5bd', FALSE, 28, '/images/products/kitchen-03.jpg', '마블 트리벳 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'kitchen'), 'herb-scissors', '허브 시저', '작은 재료 손질을 빠르게 돕는 키친 시저', '허브와 잎채소를 빠르게 다듬는 데 적합한 경량 가위입니다. 서랍 안에서도 관리하기 쉬운 크기입니다.', 21000, 'TOOL', '#588157', FALSE, 34, '/images/products/kitchen-04.jpg', '허브 시저 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'kitchen'), 'glass-storage-jar', '글라스 스토리지 자', '건식 재료를 정리하는 투명 유리 저장병', '커피 원두, 곡물, 쿠키를 보관하기 좋은 유리 저장병입니다. 선반에 올려두면 주방 장면이 더 가벼워집니다.', 26000, 'CLEAR', '#84a59d', FALSE, 31, '/images/products/kitchen-01.jpg', '글라스 스토리지 자 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'kitchen'), 'espresso-cup-set', '에스프레소 컵 세트', '짧은 루틴에 어울리는 스택형 컵 세트', '작은 받침과 함께 구성한 에스프레소 컵 세트입니다. 아침 루틴과 손님용 서빙 모두에 잘 어울립니다.', 29000, 'STACK', '#6d597a', FALSE, 37, '/images/products/kitchen-02.jpg', '에스프레소 컵 세트 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'kitchen'), 'brass-flatware-set', '브라스 커트러리 세트', '테이블 위 선을 정리하는 브라스 커트러리', '매트 브라스 톤으로 마감한 커트러리 세트입니다. 플레이트와 린넨 냅킨 조합에 따뜻한 포인트를 더합니다.', 54000, 'TABLE', '#bc6c25', FALSE, 24, '/images/products/kitchen-03.jpg', '브라스 커트러리 세트 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'kitchen'), 'ceramic-serving-bowl', '세라믹 서빙 볼', '샐러드와 파스타에 두루 쓰는 넓은 볼', '넓고 얕은 비율로 설계한 서빙 볼입니다. 한 그릇 음식과 공유용 사이드 메뉴 모두를 담기 좋습니다.', 35000, 'SERVE', '#c9ada7', FALSE, 26, '/images/products/kitchen-04.jpg', '세라믹 서빙 볼 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'kitchen'), 'oil-dispenser', '오일 디스펜서', '조리대 위를 깔끔하게 유지하는 유리 디스펜서', '손에 편하게 잡히는 슬림한 보틀과 누유를 줄이는 노즐을 적용한 오일 디스펜서입니다.', 24000, 'FLOW', '#457b9d', FALSE, 30, '/images/products/kitchen-01.jpg', '오일 디스펜서 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'kitchen'), 'tea-towel-pack', '티 타월 3P', '조리대 톤을 정리하는 코튼 타월 팩', '다른 짜임과 두께를 섞은 키친 타월 3장 구성입니다. 손을 닦고 식기를 덮는 용도로 모두 활용할 수 있습니다.', 19000, 'PACK', '#a98467', FALSE, 52, '/images/products/kitchen-02.jpg', '티 타월 3P 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'kitchen'), 'cast-iron-pan', '캐스트 아이언 팬', '느린 열감을 살리는 소형 무쇠 팬', '1인 조리와 간단한 서빙에 적합한 무쇠 팬입니다. 사용감이 쌓일수록 표면의 깊이가 살아납니다.', 74000, 'HEAT', '#495057', FALSE, 13, '/images/products/kitchen-03.jpg', '캐스트 아이언 팬 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'kitchen'), 'salad-server', '샐러드 서버', '큰 볼 요리를 마무리하는 우드 서버', '샐러드와 파스타를 가볍게 덜 수 있는 서버 세트입니다. 손잡이 길이와 무게 중심을 안정적으로 맞췄습니다.', 17000, 'WOOD', '#7f4f24', FALSE, 44, '/images/products/kitchen-04.jpg', '샐러드 서버 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'kitchen'), 'measuring-spoon-set', '메저링 스푼 세트', '베이킹 준비를 정돈하는 메탈 스푼 세트', '계량 단위를 선명하게 각인한 메저링 스푼 세트입니다. 조리 과정을 덜 복잡하게 만드는 기본 도구입니다.', 23000, 'BAKE', '#adb5bd', FALSE, 48, '/images/products/kitchen-01.jpg', '메저링 스푼 세트 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'kitchen'), 'breakfast-tray', '브렉퍼스트 트레이', '가벼운 아침 상차림을 위한 우드 트레이', '머그, 토스트, 잼 보틀을 한 번에 올리기 좋은 낮은 트레이입니다. 침대 옆이나 식탁 보조 용도로도 좋습니다.', 46000, 'MORNING', '#6b705c', FALSE, 18, '/images/products/kitchen-02.jpg', '브렉퍼스트 트레이 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'kitchen'), 'soup-ladle', '수프 레이들', '따뜻한 요리를 안정적으로 덜어내는 레이들', '깊은 냄비와 서빙 볼 사이를 부드럽게 연결하는 긴 손잡이의 레이들입니다. 매트 스틸 마감으로 관리가 쉽습니다.', 16000, 'SERVE', '#5c677d', FALSE, 57, '/images/products/kitchen-03.jpg', '수프 레이들 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'kitchen'), 'pasta-plate-set', '파스타 플레이트 세트', '소스가 잘 모이는 림 구조의 파스타 플레이트', '림 높이를 살짝 올린 플레이트 세트입니다. 파스타와 리조토, 샐러드 메뉴에 모두 잘 어울리는 기본기 있는 형태입니다.', 48000, 'DINNER', '#bcb8b1', FALSE, 29, '/images/products/kitchen-04.jpg', '파스타 플레이트 세트 상품 이미지'),

((SELECT id FROM categories WHERE slug = 'wellness'), 'cedar-incense-kit', '시더 인센스 키트', '향을 천천히 퍼뜨리는 스틱 인센스 키트', '나무와 흙내음을 섞은 인센스 스틱 세트입니다. 작업 전후로 분위기를 전환할 때 부담 없이 쓰기 좋습니다.', 24000, 'SCENT', '#6b705c', FALSE, 42, '/images/products/wellness-03.jpg', '시더 인센스 키트 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'wellness'), 'mineral-bath-salt', '미네랄 배스 솔트', '욕조와 족욕 루틴에 쓰는 미네랄 솔트', '입자가 고운 배스 솔트로 족욕과 입욕 모두에 사용할 수 있습니다. 은은한 허브 향이 물 온도와 함께 퍼집니다.', 28000, 'SOAK', '#84a59d', FALSE, 36, '/images/products/wellness-04.jpg', '미네랄 배스 솔트 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'wellness'), 'cotton-eye-mask', '코튼 아이 마스크', '잠드는 시간을 차분하게 눌러주는 아이 마스크', '가벼운 패딩과 부드러운 커버를 적용한 수면용 아이 마스크입니다. 낮잠과 장거리 이동에도 부담이 적습니다.', 18000, 'SLEEP', '#9c6644', FALSE, 51, '/images/products/wellness-01.jpg', '코튼 아이 마스크 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'wellness'), 'recovery-foam-roller', '리커버리 폼 롤러', '몸의 긴장을 풀어주는 데일리 폼 롤러', '집에서 가볍게 스트레칭할 때 쓰기 좋은 미디엄 밀도의 폼 롤러입니다. 운동 전후 루틴에 무난하게 들어갑니다.', 43000, 'RESET', '#457b9d', FALSE, 23, '/images/products/wellness-02.jpg', '리커버리 폼 롤러 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'wellness'), 'herbal-tea-box', '허벌 티 박스', '저녁 템포를 낮추는 허브 티 셀렉션', '카페인 부담이 적은 허브 티 12종을 담은 박스입니다. 작은 휴식 루틴을 만들 때 접근성이 좋은 구성입니다.', 31000, 'BREW', '#bc6c25', FALSE, 34, '/images/products/wellness-03.jpg', '허벌 티 박스 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'wellness'), 'balance-yoga-mat', '밸런스 요가 매트', '집에서도 흐름을 이어가는 뉴트럴 요가 매트', '충격 흡수와 복원력이 균형 잡힌 두께의 요가 매트입니다. 롤업 후 보관도 편한 무게로 설계했습니다.', 68000, 'FLOW', '#3a5a40', FALSE, 17, '/images/products/wellness-04.jpg', '밸런스 요가 매트 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'wellness'), 'sleep-pillow-mist', '슬립 필로우 미스트', '베개와 리넨에 뿌리는 저자극 미스트', '라벤더와 허브 계열 향을 가볍게 조합한 필로우 미스트입니다. 취침 전 루틴을 일정하게 만들어 줍니다.', 22000, 'MIST', '#588157', FALSE, 46, '/images/products/wellness-01.jpg', '슬립 필로우 미스트 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'wellness'), 'bamboo-body-brush', '뱀부 바디 브러시', '건식 마사지에 쓰는 내추럴 브러시', '욕실과 파우더룸에서 함께 쓰기 좋은 바디 브러시입니다. 손잡이 길이와 브러시 밀도를 가볍게 맞췄습니다.', 27000, 'CARE', '#a98467', FALSE, 28, '/images/products/wellness-02.jpg', '뱀부 바디 브러시 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'wellness'), 'hand-cream-duo', '핸드 크림 듀오', '낮과 밤에 나눠 쓰는 핸드 크림 2종', '끈적임을 줄인 데일리 타입과 보습감을 높인 나이트 타입으로 구성한 세트입니다.', 26000, 'DUO', '#b56576', FALSE, 39, '/images/products/wellness-03.jpg', '핸드 크림 듀오 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'wellness'), 'stone-diffuser', '스톤 디퓨저', '전기 없이 향을 퍼뜨리는 세라믹 디퓨저', '다공성 스톤에 오일을 떨어뜨려 사용하는 방식의 디퓨저입니다. 책상과 침대 옆에 두기 좋은 크기입니다.', 34000, 'QUIET', '#adb5bd', FALSE, 22, '/images/products/wellness-04.jpg', '스톤 디퓨저 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'wellness'), 'sauna-towel-set', '사우나 타월 세트', '욕실 루틴을 가볍게 정리하는 타월 세트', '흡수력과 건조 속도를 함께 고려한 타월 세트입니다. 운동 후 샤워나 홈 스파 루틴에 적합합니다.', 42000, 'TOWEL', '#c9ada7', FALSE, 25, '/images/products/wellness-01.jpg', '사우나 타월 세트 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'wellness'), 'meditation-cushion', '메디테이션 쿠션', '앉는 자세를 편하게 지지하는 원형 쿠션', '허리를 세우기 쉬운 높이와 밀도로 만든 메디테이션 쿠션입니다. 짧은 호흡 루틴에도 안정감을 더합니다.', 52000, 'POSTURE', '#6d597a', FALSE, 14, '/images/products/wellness-02.jpg', '메디테이션 쿠션 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'wellness'), 'calming-candle', '카밍 캔들', '저녁 조도를 낮추는 웜 톤 캔들', '우디와 리넨 노트를 담은 캔들입니다. 향보다 광량과 잔향의 균형을 중요하게 두고 만든 타입입니다.', 33000, 'GLOW', '#e5989b', FALSE, 31, '/images/products/wellness-03.jpg', '카밍 캔들 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'wellness'), 'journal-set', '리추얼 저널 세트', '하루 템포를 정리하는 저널과 펜 세트', '체크리스트와 자유 메모를 함께 담을 수 있는 구성의 저널 세트입니다. 취침 전 루틴 기록에 어울립니다.', 29000, 'WRITE', '#7f5539', FALSE, 33, '/images/products/wellness-04.jpg', '리추얼 저널 세트 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'wellness'), 'stretch-band-kit', '스트레치 밴드 키트', '가벼운 홈 스트레칭을 위한 밴드 키트', '강도가 다른 밴드 세 개와 파우치를 함께 구성했습니다. 작은 공간에서도 보관과 사용이 간단합니다.', 25000, 'MOVE', '#355070', FALSE, 41, '/images/products/wellness-01.jpg', '스트레치 밴드 키트 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'wellness'), 'scalp-massage-brush', '스칼프 마사지 브러시', '샴푸 루틴에 더하는 실리콘 브러시', '두피를 자극 없이 정리하는 실리콘 소재 브러시입니다. 욕실 선반 위에 두기 쉬운 작은 크기입니다.', 17000, 'WASH', '#5e548e', FALSE, 49, '/images/products/wellness-02.jpg', '스칼프 마사지 브러시 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'wellness'), 'terry-slippers', '테리 슬리퍼', '샤워 후 발을 부드럽게 감싸는 슬리퍼', '테리 소재 커버와 가벼운 밑창으로 만든 슬리퍼입니다. 욕실과 침실 사이 이동을 편하게 해 줍니다.', 24000, 'HOME', '#6a994e', FALSE, 37, '/images/products/wellness-03.jpg', '테리 슬리퍼 상품 이미지'),
((SELECT id FROM categories WHERE slug = 'wellness'), 'daily-vitamin-case', '데일리 비타민 케이스', '하루 루틴을 분리해 담는 컴팩트 케이스', '요일별로 나뉜 수납 구조를 적용한 휴대용 비타민 케이스입니다. 여행과 출근 가방에 넣기 쉬운 크기입니다.', 15000, 'ROUTINE', '#8d99ae', FALSE, 58, '/images/products/wellness-04.jpg', '데일리 비타민 케이스 상품 이미지');
