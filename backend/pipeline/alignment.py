from PIL import Image


CANVAS_SIZE = (768, 1024)


def _mask_bbox(mask: Image.Image):
    return mask.getbbox()


def _centered_canvas(image: Image.Image, mask: Image.Image) -> tuple[Image.Image, Image.Image]:
    bbox = _mask_bbox(mask)
    if bbox is None:
        bbox = (0, 0, image.width, image.height)

    left, top, right, bottom = bbox
    width = right - left
    height = bottom - top
    pad_x = int(width * 0.12)
    pad_y = int(height * 0.08)

    crop_box = (
        max(0, left - pad_x),
        max(0, top - pad_y),
        min(image.width, right + pad_x),
        min(image.height, bottom + pad_y),
    )

    cropped_image = image.crop(crop_box)
    cropped_mask = mask.crop(crop_box)

    scale = min(
        CANVAS_SIZE[0] / max(1, cropped_image.width),
        CANVAS_SIZE[1] / max(1, cropped_image.height),
    )
    target_size = (
        max(1, int(cropped_image.width * scale)),
        max(1, int(cropped_image.height * scale)),
    )

    resized_image = cropped_image.resize(target_size, Image.Resampling.LANCZOS)
    resized_mask = cropped_mask.resize(target_size, Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", CANVAS_SIZE, (255, 255, 255, 0))
    mask_canvas = Image.new("L", CANVAS_SIZE, 0)

    offset = (
        (CANVAS_SIZE[0] - target_size[0]) // 2,
        (CANVAS_SIZE[1] - target_size[1]) // 2,
    )
    canvas.paste(resized_image, offset, resized_image)
    mask_canvas.paste(resized_mask, offset)
    return canvas, mask_canvas


def run_alignment(segmentation_output: dict) -> dict:
    normalized_views = {}
    normalized_masks = {}

    for view, image in segmentation_output["views"].items():
        mask = segmentation_output["masks"][view]
        aligned_image, aligned_mask = _centered_canvas(image, mask)
        normalized_views[view] = aligned_image
        normalized_masks[view] = aligned_mask

    return {
        **segmentation_output,
        "normalized_views": normalized_views,
        "normalized_masks": normalized_masks,
        "stage": "alignment",
        "canonical_views": ["front", "back", "left", "right"],
    }
