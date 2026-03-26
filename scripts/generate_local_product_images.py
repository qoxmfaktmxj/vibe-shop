from __future__ import annotations

import argparse
import random
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageEnhance, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PRODUCT_IMAGE_DIR = ROOT / "apps" / "storefront" / "public" / "images" / "products"
TARGET_SIZE = (900, 1200)
TOTAL_IMAGES_PER_CATEGORY = 100
CATEGORY_NAMES = ("living", "kitchen", "wellness")


def source_paths(category: str) -> Iterable[Path]:
    ordered: list[Path] = []
    ordered.extend(sorted(PRODUCT_IMAGE_DIR.glob(f"{category}-src-*.jpg")))
    ordered.extend(sorted(PRODUCT_IMAGE_DIR.glob(f"{category}-ref-*.jpg")))
    if not ordered:
        ordered.extend(sorted(PRODUCT_IMAGE_DIR.glob(f"{category}-0[1-4].jpg")))
    return ordered


def fit_to_canvas(source: Image.Image, rng: random.Random) -> Image.Image:
    crop_scale = rng.uniform(0.82, 0.98)
    crop_width = max(1, int(source.width * crop_scale))
    crop_height = max(1, int(source.height * crop_scale))
    left = rng.randint(0, max(0, source.width - crop_width))
    top = rng.randint(0, max(0, source.height - crop_height))
    box = (left, top, left + crop_width, top + crop_height)
    cropped = source.crop(box)
    return ImageOps.fit(cropped, TARGET_SIZE, method=Image.Resampling.LANCZOS, centering=(rng.uniform(0.35, 0.65), rng.uniform(0.35, 0.65)))


def transform_image(source: Image.Image, category: str, variant_index: int) -> Image.Image:
    rng = random.Random(f"{category}:{variant_index}")
    working = source.convert("RGB")

    if rng.random() < 0.65:
        working = working.transpose(Image.Transpose.FLIP_LEFT_RIGHT)

    if rng.random() < 0.18:
        working = working.transpose(Image.Transpose.FLIP_TOP_BOTTOM)

    rotation = rng.uniform(-2.2, 2.2)
    working = working.rotate(rotation, resample=Image.Resampling.BICUBIC, expand=False)
    working = fit_to_canvas(working, rng)

    working = ImageEnhance.Brightness(working).enhance(rng.uniform(0.93, 1.08))
    working = ImageEnhance.Contrast(working).enhance(rng.uniform(0.94, 1.16))
    working = ImageEnhance.Color(working).enhance(rng.uniform(0.86, 1.18))
    working = ImageEnhance.Sharpness(working).enhance(rng.uniform(0.96, 1.22))

    tint_map = {
        "living": (12, 6, -2),
        "kitchen": (10, 4, -6),
        "wellness": (-4, 10, 10),
    }
    tint = tint_map[category]
    alpha = rng.uniform(0.04, 0.12)
    tint_layer = Image.new("RGB", TARGET_SIZE, tuple(max(0, min(255, 255 + channel)) for channel in tint))
    working = Image.blend(working, tint_layer, alpha)

    if rng.random() < 0.15:
        working = working.filter(ImageFilter.GaussianBlur(radius=rng.uniform(0.2, 0.55)))

    return working


def generate_category_images(category: str, total_images: int) -> None:
    sources = list(source_paths(category))
    if len(sources) < 4:
        raise RuntimeError(f"Expected at least 4 source images for {category}, found {len(sources)}")

    base_images = [Image.open(path) for path in sources]
    try:
        for index in range(1, total_images + 1):
            cycle = (index - 1) // len(base_images)
            order = list(range(len(base_images)))
            random.Random(f"{category}:cycle:{cycle}").shuffle(order)
            source = base_images[order[(index - 1) % len(base_images)]]
            variant = transform_image(source, category, index)
            output_path = PRODUCT_IMAGE_DIR / f"{category}-{index:02d}.jpg"
            variant.save(output_path, format="JPEG", quality=92, optimize=True)
    finally:
        for image in base_images:
            image.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate storefront product images from local source assets.")
    parser.add_argument(
        "--category",
        choices=CATEGORY_NAMES,
        help="Generate images only for one category.",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=TOTAL_IMAGES_PER_CATEGORY,
        help="Images to generate per category.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    categories = (args.category,) if args.category else CATEGORY_NAMES
    for category in categories:
        generate_category_images(category, args.count)
        print(f"generated {category} images: {args.count}")


if __name__ == "__main__":
    main()
