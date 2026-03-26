from __future__ import annotations

from pathlib import Path
from typing import Iterable

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PRODUCT_DIR = ROOT / "apps" / "storefront" / "public" / "images" / "products"


def dhash(path: Path, size: int = 8) -> int:
    image = Image.open(path).convert("L").resize((size + 1, size), Image.Resampling.LANCZOS)
    result = 0
    bit = 1
    for row in range(size):
        for col in range(size):
            if image.getpixel((col, row)) > image.getpixel((col + 1, row)):
                result |= bit
            bit <<= 1
    return result


def hamming_distance(a: int, b: int) -> int:
    return (a ^ b).bit_count()


def image_files() -> Iterable[Path]:
    for path in sorted(PRODUCT_DIR.glob("*.jpg")):
        if path.name.startswith("generated-contact-sheet"):
            continue
        yield path


def main() -> None:
    items = [(path, dhash(path)) for path in image_files()]
    groups: list[list[Path]] = []
    used: set[Path] = set()

    for index, (path, hash_value) in enumerate(items):
        if path in used:
            continue
        group = [path]
        used.add(path)
        for other_path, other_hash in items[index + 1 :]:
            if other_path in used:
                continue
            if hamming_distance(hash_value, other_hash) <= 6:
                group.append(other_path)
                used.add(other_path)
        if len(group) > 1:
            groups.append(group)

    if not groups:
        print("No near-duplicate image groups found.")
        return

    for group in groups:
        print("Group:")
        for path in group:
            print(f"  {path.name}")


if __name__ == "__main__":
    main()
