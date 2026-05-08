import base64
from io import BytesIO


def _to_data_url(image, format_name="PNG"):
    buffer = BytesIO()
    image.save(buffer, format=format_name)
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    mime = "image/png" if format_name == "PNG" else "image/jpeg"
    return f"data:{mime};base64,{encoded}"


def run_texture(reconstruction_output: dict) -> dict:
    normalized_views = reconstruction_output.get("normalized_views", {})
    normalized_masks = reconstruction_output.get("normalized_masks", {})

    normalized_data = {
        view: _to_data_url(image)
        for view, image in normalized_views.items()
    }
    mask_data = {
        view: _to_data_url(mask)
        for view, mask in normalized_masks.items()
    }

    preview_images = [normalized_data[view] for view in ["front", "back", "left", "right"] if view in normalized_data]

    return {
        "status": "completed",
        "stage": "complete",
        "progress": 100,
        "warnings": [
            "Phase 2 preprocessing generated segmented masks and aligned body crops for this session.",
            "Texture baking and higher-fidelity export are still planned for later milestones.",
        ],
        "measurements": reconstruction_output.get("measurements"),
        "smplParams": reconstruction_output.get("smpl"),
        "confidence": 0.78,
        "previewImageDataUrls": preview_images,
        "normalizedImageDataUrls": normalized_data,
        "maskDataUrls": mask_data,
        "resultGlbUrl": None,
        "resultObjUrl": None,
    }
