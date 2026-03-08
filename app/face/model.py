import cv2
from insightface.app import FaceAnalysis

# Load model once (CPU only)
model = FaceAnalysis(
    name="buffalo_s",
    providers=["CPUExecutionProvider"]
)

# Prepare detection
model.prepare(
    ctx_id=0,
    det_size=(320, 320)
)


def get_face_embedding(image):

    faces = model.get(image)

    if len(faces) == 0:
        return None

    return faces[0].embedding