from __future__ import annotations

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PRODUCT_DIR = ROOT / "apps" / "storefront" / "public" / "images" / "products"


RENAME_MAP = {
    "living-src-01.jpg": "living-ref-spring-collection.jpg",
    "living-src-04.jpg": "living-ref-new-arrivals-bed.jpg",
    "living-src-05.jpg": "living-ref-accent-chair.jpg",
    "living-src-06.jpg": "living-ref-sofa-throw.jpg",
    "living-src-07.jpg": "living-ref-bedroom-arrivals.jpg",
    "living-src-08.jpg": "living-ref-modern-chair.jpg",
    "living-src-09.jpg": "living-ref-lounge-seating.jpg",
    "living-src-10.jpg": "living-ref-sofa-throw-2.jpg",
    "living-ref-ceramic-vessels.jpg": "kitchen-ref-ceramic-vessels.jpg",
    "living-ref-dining-room.jpg": "kitchen-ref-dining-room.jpg",
    "wellness-src-01.jpg": "wellness-ref-ceramic-vessels-smoke.jpg",
    "wellness-src-02.jpg": "wellness-ref-blue-vase.jpg",
}

DELETE_FILES = {
    "generated-1774339215870.png",
    "generated-1774339225114.png",
    "generated-1774339262924.png",
    "generated-contact-sheet.jpg",
}


def save_as_jpeg(source: Path, target: Path) -> None:
    image = Image.open(source).convert("RGB")
    image.save(target, format="JPEG", quality=92, optimize=True)


def main() -> None:
    for filename in DELETE_FILES:
        path = PRODUCT_DIR / filename
        if path.exists():
            path.unlink()

    for source_name, target_name in RENAME_MAP.items():
        source = PRODUCT_DIR / source_name
        target = PRODUCT_DIR / target_name
        if not source.exists():
            continue
        if target.exists():
            target.unlink()
        save_as_jpeg(source, target)
        source.unlink()

    print("curated generated images")
    for path in sorted(PRODUCT_DIR.glob("*-ref-*.jpg")):
        print(path.name)


if __name__ == "__main__":
    main()
