def run_segmentation(views: dict) -> dict:
    return {
        "views": views,
        "stage": "segmentation",
        "notes": [
            "Phase 1 uses lightweight foreground handling.",
            "Phase 2 upgrades this stage to SAM 3 segmentation and background removal.",
        ],
    }
