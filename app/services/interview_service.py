import numpy as np
import cv2

from app.face.model import get_face_embedding
from app.face.utils import cosine_similarity

from app.liveness.blink_detector import detect_blink
from app.liveness.head_pose import detect_head_turn

EMBED_STORAGE = "app/storage/embeddings"


def verify_interview(unique_id, webcam_image):

    frame = cv2.imdecode(
        np.frombuffer(webcam_image, np.uint8),
        cv2.IMREAD_COLOR
    )

    blink = detect_blink(frame)

    head_turn = detect_head_turn(frame)
    if not blink and not head_turn:
        return {
        "status": "Please blink and try again"
    }
    stored_emb = np.load(f"{EMBED_STORAGE}/{unique_id}.npy")

    current_emb = get_face_embedding(frame)

    similarity = cosine_similarity(stored_emb, current_emb)

    if similarity < 0.5:
        return {
            "status": "Face mismatch"
        }

    return {
        "status": "Verification successful"
    }