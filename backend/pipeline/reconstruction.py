def run_reconstruction(alignment_output: dict) -> dict:
    return {
        **alignment_output,
        "stage": "reconstruction",
        "measurements": {
            "height": 172,
            "bust": 92,
            "waist": 78,
            "hips": 96,
            "shoulders": 44,
        },
        "smpl": {
            "model": "phase1-smpl-baseline",
            "pose": "canonical-standing",
        },
    }
