import random
from datetime import datetime

# AI fraud detection stub (to be replaced with real ML model)
def get_risk_score(features: dict) -> float:
    # Example: velocity, amount deviation, device, merchant, hour
    # TODO: Integrate with real anomaly detection service
    score = random.uniform(0, 1)
    return score

# Rules engine
BLOCK_THRESHOLD = 0.95
REVIEW_THRESHOLD = 0.7

def risk_decision(score: float) -> str:
    if score >= BLOCK_THRESHOLD:
        return "block"
    elif score >= REVIEW_THRESHOLD:
        return "review"
    else:
        return "allow"
