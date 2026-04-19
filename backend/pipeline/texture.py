def run_texture(reconstruction_output: dict) -> dict:
    return {
        "status": "completed",
        "stage": "complete",
        "progress": 100,
        "warnings": [
            "This local preview is still a coarse mesh.",
            "Texture baking and higher-fidelity export are not enabled in the current backend.",
        ],
        "measurements": reconstruction_output.get("measurements"),
        "smplParams": reconstruction_output.get("smpl"),
        "confidence": 0.7,
        "resultGlbUrl": None,
        "resultObjUrl": None,
    }
