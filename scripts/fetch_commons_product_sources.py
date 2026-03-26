from __future__ import annotations

import argparse
import json
import re
import sys
import time
from dataclasses import asdict, dataclass
from html import unescape
from io import BytesIO
from pathlib import Path
from typing import Iterable
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from PIL import Image, ImageOps


sys.stdout.reconfigure(encoding="utf-8", errors="replace")


ROOT = Path(__file__).resolve().parents[1]
PRODUCT_IMAGE_DIR = ROOT / "apps" / "storefront" / "public" / "images" / "products"
MANIFEST_PATH = PRODUCT_IMAGE_DIR / "commons-source-manifest.json"
TARGET_SOURCES_PER_CATEGORY = 48
PAGE_SIZE = 50
REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "application/json,text/plain,*/*",
    "Accept-Language": "en-US,en;q=0.9",
}
ALLOWED_FILETYPES = {"jpg", "jpeg", "png", "webp"}
ALLOWED_LICENSE_TOKENS = ("public domain", "cc by", "cc by-sa", "cc0")
NEAR_DUPLICATE_DISTANCE = 6


@dataclass(frozen=True)
class CommonsAsset:
    category: str
    query: str
    title: str
    object_name: str | None
    creator: str | None
    license_short: str
    usage_terms: str | None
    url: str
    description_url: str
    width: int
    height: int
    filename: str


CATEGORY_QUERIES: dict[str, tuple[str, ...]] = {
    "living": (
        "living room interior -painting -art -museum",
        "living room decor -painting -art -museum",
        "modern living room -painting -art -museum",
        "cozy sofa interior -painting -art -museum",
        "apartment interior -painting -art -museum",
        "scandinavian interior -painting -art -museum",
        "home lounge interior -painting -art -museum",
        "bedroom interior -painting -art -museum",
    ),
    "kitchen": (
        "kitchen interior -painting -art -museum",
        "modern kitchen -painting -art -museum",
        "dining room interior -painting -art -museum",
        "kitchen decor -painting -art -museum",
        "kitchen shelf -painting -art -museum",
        "ceramic vessels -painting -art -museum",
        "countertop decor -painting -art -museum",
        "open kitchen interior -painting -art -museum",
    ),
    "wellness": (
        "spa interior -painting -art -museum",
        "bathroom interior -painting -art -museum",
        "bathroom decor -painting -art -museum",
        "hotel spa interior -painting -art -museum",
        "massage room interior -painting -art -museum",
        "aromatherapy -painting -art -museum",
        "meditation room -painting -art -museum",
        "bathhouse interior -painting -art -museum",
        "bathroom shelf -painting -art -museum",
    ),
}


CATEGORY_KEYWORDS: dict[str, tuple[str, ...]] = {
    "living": ("living", "room", "sofa", "couch", "chair", "lounge", "bed", "bedroom", "interior", "home", "decor"),
    "kitchen": ("kitchen", "dining", "table", "counter", "countertop", "cabinet", "shelf", "ceramic", "vessel", "interior"),
    "wellness": ("spa", "bath", "bathroom", "bathhouse", "wellness", "aromatherapy", "meditation", "massage", "hotel", "towel", "vase", "ceramic", "calm"),
}


CATEGORY_EXTRA_BLOCKS: dict[str, tuple[str, ...]] = {
    "wellness": ("car", "truck", "vehicle", "train", "bus", "compartment", "plant", "flower", "tree", "ranger"),
}


BLOCKED_TERMS = (
    "painting",
    "portrait",
    "drawing",
    "illustration",
    "sketch",
    "art project",
    "google art project",
    "museum",
    "sculpture",
    "poster",
    "brochure",
    "pdf",
    "licensed under",
    "cc by",
    "cc by-sa",
    "people",
    "person",
    "man",
    "woman",
    "boy",
    "girl",
    "child",
    "baby",
    "dog",
    "cat",
)


def commons_request(params: dict[str, object]) -> dict:
    url = "https://commons.wikimedia.org/w/api.php?" + urlencode(params)
    request = Request(url, headers=REQUEST_HEADERS)
    for attempt in range(5):
        try:
            with urlopen(request, timeout=60) as response:
                return json.loads(response.read().decode("utf-8"))
        except Exception as exc:
            status = getattr(exc, "code", None)
            if status not in {429, 503} or attempt == 4:
                raise
            time.sleep(2 ** attempt)


def normalize_text(value: str | None) -> str:
    if not value:
        return ""
    cleaned = unescape(value)
    cleaned = re.sub(r"<[^>]+>", " ", cleaned)
    cleaned = cleaned.lower()
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def dhash(image: Image.Image, size: int = 8) -> int:
    gray = ImageOps.exif_transpose(image).convert("L").resize((size + 1, size), Image.Resampling.LANCZOS)
    result = 0
    bit = 1
    for row in range(size):
        for col in range(size):
            if gray.getpixel((col, row)) > gray.getpixel((col + 1, row)):
                result |= bit
            bit <<= 1
    return result


def hamming_distance(a: int, b: int) -> int:
    return (a ^ b).bit_count()


def download_image(url: str) -> Image.Image:
    request = Request(url, headers=REQUEST_HEADERS)
    for attempt in range(5):
        try:
            with urlopen(request, timeout=90) as response:
                raw = response.read()
            break
        except Exception as exc:
            status = getattr(exc, "code", None)
            if status not in {429, 503} or attempt == 4:
                raise
            time.sleep(2 ** attempt)
    image = Image.open(BytesIO(raw))
    image.load()
    return ImageOps.exif_transpose(image).convert("RGB")


def safe_filename(value: str) -> str:
    lowered = value.lower()
    lowered = re.sub(r"[^a-z0-9]+", "-", lowered)
    lowered = re.sub(r"-+", "-", lowered).strip("-")
    return lowered or "asset"


def relevant_text(category: str, item: dict) -> str:
    info = item.get("imageinfo", [{}])[0]
    ext = info.get("extmetadata", {})
    pieces = [
        item.get("title"),
        ext.get("ObjectName", {}).get("value"),
        ext.get("ImageDescription", {}).get("value"),
    ]
    return normalize_text(" ".join(part for part in pieces if part))


def accepted_asset(category: str, item: dict) -> bool:
    info = item.get("imageinfo", [{}])[0]
    if info.get("mime") not in {"image/jpeg", "image/png", "image/webp"}:
        return False

    width = int(info.get("width") or 0)
    height = int(info.get("height") or 0)
    if width < 800 or height < 600:
        return False

    ext = info.get("extmetadata", {})
    license_short = normalize_text(ext.get("LicenseShortName", {}).get("value"))
    usage_terms = normalize_text(ext.get("UsageTerms", {}).get("value"))
    if not any(token in f"{license_short} {usage_terms}" for token in ALLOWED_LICENSE_TOKENS):
        return False
    if "nd" in license_short or "no derivatives" in usage_terms:
        return False

    text = relevant_text(category, item)
    if not any(keyword in text for keyword in CATEGORY_KEYWORDS[category]):
        return False
    if any(block in text for block in BLOCKED_TERMS):
        return False
    if any(block in text for block in CATEGORY_EXTRA_BLOCKS.get(category, ())):
        return False

    return True


def iterate_results(category: str) -> Iterable[tuple[str, dict]]:
    for query in CATEGORY_QUERIES[category]:
        offset = 0
        while True:
            data = commons_request(
                {
                    "action": "query",
                    "generator": "search",
                    "gsrsearch": query,
                    "gsrnamespace": 6,
                    "gsrlimit": PAGE_SIZE,
                    "prop": "imageinfo",
                    "iiprop": "url|extmetadata|mime|size",
                    "iiurlwidth": 1000,
                    "format": "json",
                    "formatversion": 2,
                    "gsroffset": offset,
                }
            )
            pages = data.get("query", {}).get("pages", [])
            if not pages:
                break
            for item in pages:
                yield query, item
            next_offset = data.get("continue", {}).get("gsroffset")
            if next_offset is None or int(next_offset) <= offset:
                break
            offset = int(next_offset)


def download_category_sources(category: str, count: int) -> list[CommonsAsset]:
    PRODUCT_IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    for existing in PRODUCT_IMAGE_DIR.glob(f"{category}-src-*.jpg"):
        existing.unlink()
    accepted: list[CommonsAsset] = []
    hashes: list[int] = []
    seen_urls: set[str] = set()
    seen_titles: set[str] = set()

    for query, item in iterate_results(category):
        if len(accepted) >= count:
            break
        if not accepted_asset(category, item):
            continue

        info = item["imageinfo"][0]
        url = str(info.get("thumburl") or info.get("url") or "")
        title = str(item.get("title") or "")
        if not url or url in seen_urls or title in seen_titles:
            continue

        try:
            image = download_image(url)
        except Exception:
            continue

        hash_value = dhash(image)
        if any(hamming_distance(hash_value, existing) <= NEAR_DUPLICATE_DISTANCE for existing in hashes):
            continue

        index = len(accepted) + 1
        object_name = normalize_text(info.get("extmetadata", {}).get("ObjectName", {}).get("value"))
        raw_name = safe_filename(object_name or title.replace("File:", ""))
        filename = f"{category}-src-{index:03d}-{raw_name}.jpg"
        output_path = PRODUCT_IMAGE_DIR / filename
        image.save(output_path, format="JPEG", quality=94, optimize=True)

        ext = info.get("extmetadata", {})
        accepted.append(
            CommonsAsset(
                category=category,
                query=query,
                title=title,
                object_name=object_name or None,
                creator=normalize_text(ext.get("Artist", {}).get("value")) or None,
                license_short=normalize_text(ext.get("LicenseShortName", {}).get("value")),
                usage_terms=normalize_text(ext.get("UsageTerms", {}).get("value")) or None,
                url=url,
                description_url=str(info.get("descriptionurl") or ""),
                width=int(info.get("width") or 0),
                height=int(info.get("height") or 0),
                filename=filename,
            )
        )
        hashes.append(hash_value)
        seen_urls.add(url)
        seen_titles.add(title)
        print(f"[{category}] {len(accepted):02d}/{count}: {title}")

    if len(accepted) < count:
        raise RuntimeError(f"Only collected {len(accepted)} sources for {category}; expected {count}")

    return accepted


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Download diverse storefront product source images from Wikimedia Commons.")
    parser.add_argument(
        "--category",
        choices=tuple(CATEGORY_QUERIES.keys()),
        help="Download sources only for one category.",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=TARGET_SOURCES_PER_CATEGORY,
        help="Number of source images to collect per category.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    categories = (args.category,) if args.category else tuple(CATEGORY_QUERIES.keys())
    manifest: list[CommonsAsset] = []
    for category in categories:
        manifest.extend(download_category_sources(category, args.count))

    MANIFEST_PATH.write_text(
        json.dumps([asdict(item) for item in manifest], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"wrote manifest: {MANIFEST_PATH}")


if __name__ == "__main__":
    main()
