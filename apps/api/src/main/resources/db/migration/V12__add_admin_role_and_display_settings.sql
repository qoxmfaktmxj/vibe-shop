ALTER TABLE users
ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER';

CREATE TABLE admin_display_settings (
    id BIGINT PRIMARY KEY,
    hero_title VARCHAR(255) NOT NULL,
    hero_subtitle TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

INSERT INTO admin_display_settings (id, hero_title, hero_subtitle, updated_at)
VALUES (
    1,
    '리빙의 결을 따라 고른 이번 시즌 셀렉션',
    '리빙, 키친, 웰니스 카테고리에서 지금 바로 보기 좋은 신상품과 인기 상품만 따로 제안합니다.',
    NOW()
);
