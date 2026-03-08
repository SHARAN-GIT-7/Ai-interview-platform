import numpy as np


def cosine_similarity(emb1, emb2):

    emb1 = emb1 / np.linalg.norm(emb1)
    emb2 = emb2 / np.linalg.norm(emb2)

    similarity = np.dot(emb1, emb2)

    return similarity