import numpy as np


def _silhouette_stats(mask):
    mask_array = np.asarray(mask, dtype=np.uint8) > 0
    coords = np.argwhere(mask_array)

    if coords.size == 0:
        return {
            "height_ratio": 0.78,
            "width_ratio": 0.32,
        }

    top = coords[:, 0].min()
    bottom = coords[:, 0].max()
    left = coords[:, 1].min()
    right = coords[:, 1].max()

    return {
        "height_ratio": (bottom - top + 1) / mask.height,
        "width_ratio": (right - left + 1) / mask.width,
    }


def _estimate_measurements(normalized_masks: dict):
    front = _silhouette_stats(normalized_masks["front"])
    side = _silhouette_stats(normalized_masks["left"])

    width_scale = front["width_ratio"] / 0.32
    depth_scale = side["width_ratio"] / 0.22
    height_scale = front["height_ratio"] / 0.78

    return {
        "height": round(172 * height_scale),
        "bust": round(92 * (0.55 * width_scale + 0.45 * depth_scale)),
        "waist": round(78 * (0.55 * width_scale + 0.45 * depth_scale)),
        "hips": round(96 * (0.55 * width_scale + 0.45 * depth_scale)),
        "shoulders": round(44 * width_scale),
    }


def run_reconstruction(alignment_output: dict) -> dict:
    measurements = _estimate_measurements(alignment_output["normalized_masks"])

    return {
        **alignment_output,
        "stage": "reconstruction",
        "measurements": measurements,
        "smpl": {
            "model": "phase2-preprocessed-smpl-baseline",
            "pose": "canonical-standing",
        },
    }
