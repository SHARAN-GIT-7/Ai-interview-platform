import cv2
import numpy as np

from app.face.model import get_face_embedding
from app.face.utils import cosine_similarity


def compare_faces(img1, img2):

    emb1 = get_face_embedding(img1)

    emb2 = get_face_embedding(img2)

    if emb1 is None or emb2 is None:
        return False, 0

    similarity = cosine_similarity(emb1, emb2)

    return similarity > 0.5, similarity