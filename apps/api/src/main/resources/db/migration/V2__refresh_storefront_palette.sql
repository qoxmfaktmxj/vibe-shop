UPDATE categories
SET accent_color = CASE slug
    WHEN 'living' THEN '#29339b'
    WHEN 'kitchen' THEN '#ff3a20'
    WHEN 'wellness' THEN '#74a4bc'
    ELSE accent_color
END
WHERE slug IN ('living', 'kitchen', 'wellness');

UPDATE products
SET accent_color = CASE slug
    WHEN 'linen-bed-set' THEN '#29339b'
    WHEN 'curve-floor-lamp' THEN '#74a4bc'
    WHEN 'stone-plate-set' THEN '#ff3a20'
    WHEN 'brew-mug' THEN '#29339b'
    WHEN 'calm-aroma-oil' THEN '#74a4bc'
    WHEN 'soft-robe' THEN '#14281d'
    ELSE accent_color
END
WHERE slug IN (
    'linen-bed-set',
    'curve-floor-lamp',
    'stone-plate-set',
    'brew-mug',
    'calm-aroma-oil',
    'soft-robe'
);
