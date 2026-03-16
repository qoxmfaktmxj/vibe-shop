ALTER TABLE products
ADD COLUMN popularity_score INTEGER NOT NULL DEFAULT 0,
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();

UPDATE products
SET created_at = TIMESTAMPTZ '2026-02-01 09:00:00+09' + ((id - 1) * INTERVAL '3 hours');

UPDATE products
SET popularity_score = CASE slug
    WHEN 'linen-bed-set' THEN 980
    WHEN 'stone-plate-set' THEN 970
    WHEN 'calm-aroma-oil' THEN 960
    WHEN 'curve-floor-lamp' THEN 940
    WHEN 'soft-robe' THEN 920
    WHEN 'brew-mug' THEN 910
    WHEN 'boucle-lounge-chair' THEN 880
    WHEN 'stainless-kettle' THEN 870
    WHEN 'balance-yoga-mat' THEN 860
    WHEN 'journal-set' THEN 840
    ELSE GREATEST(140, 620 - (stock * 4) + CASE WHEN featured THEN 120 ELSE 0 END)
END;
