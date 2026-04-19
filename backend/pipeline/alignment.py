def run_alignment(segmentation_output: dict) -> dict:
    return {
        **segmentation_output,
        "stage": "alignment",
        "canonical_views": ["front", "back", "left", "right"],
    }
