from io import BytesIO
from urllib.request import urlopen

import numpy as np
from PIL import Image, ImageFilter


def _load_image(view_url: str) -> Image.Image:
    with urlopen(view_url) as response:
        return Image.open(BytesIO(response.read())).convert("RGBA")


def _estimate_background(rgb: np.ndarray) -> np.ndarray:
    h, w, _ = rgb.shape
    patch = max(8, min(h, w) // 16)
    corners = np.concatenate(
        [
            rgb[:patch, :patch].reshape(-1, 3),
            rgb[:patch, -patch:].reshape(-1, 3),
            rgb[-patch:, :patch].reshape(-1, 3),
            rgb[-patch:, -patch:].reshape(-1, 3),
        ],
        axis=0,
    )
    return np.median(corners, axis=0)


def _mask_from_image(image: Image.Image) -> Image.Image:
    rgb = np.asarray(image.convert("RGB"), dtype=np.int16)
    background = _estimate_background(rgb)
    color_distance = np.linalg.norm(rgb - background, axis=2)
    luminance = rgb.mean(axis=2)

    mask = (color_distance > 28) | (luminance < 235)

    if not np.any(mask):
        mask = np.ones((rgb.shape[0], rgb.shape[1]), dtype=bool)

    mask_image = Image.fromarray((mask.astype(np.uint8) * 255), mode="L")
    mask_image = mask_image.filter(ImageFilter.MaxFilter(5))
    mask_image = mask_image.filter(ImageFilter.GaussianBlur(1.2))
    return mask_image.point(lambda value: 255 if value > 96 else 0)


def _apply_mask(image: Image.Image, mask: Image.Image) -> Image.Image:
    cutout = image.copy()
    cutout.putalpha(mask)
    return cutout


def run_segmentation(views: dict) -> dict:
    segmented_views = {}
    masks = {}
    notes = [
        "Phase 2 preprocessing is active with lightweight person segmentation and background cleanup.",
        "SAM 3 integration is still planned, but masked crops are now generated before reconstruction.",
    ]

    for view, view_url in views.items():
        image = _load_image(view_url)
        mask = _mask_from_image(image)
        segmented_views[view] = _apply_mask(image, mask)
        masks[view] = mask

    return {
        "views": segmented_views,
        "masks": masks,
        "stage": "segmentation",
        "notes": notes,
    }
