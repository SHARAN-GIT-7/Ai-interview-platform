import cv2
import mediapipe as mp
import numpy as np

mp_face_mesh = mp.solutions.face_mesh


def detect_blink(frame):

    with mp_face_mesh.FaceMesh(
        static_image_mode=False,
        max_num_faces=1,
        refine_landmarks=True
    ) as face_mesh:

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        result = face_mesh.process(rgb)

        if not result.multi_face_landmarks:
            return False

        landmarks = result.multi_face_landmarks[0].landmark

        top = landmarks[159].y
        bottom = landmarks[145].y

        ear = abs(top - bottom)

        if ear < 0.01:
            return True

        return False