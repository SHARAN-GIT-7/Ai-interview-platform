import cv2
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh


def detect_head_turn(frame):

    with mp_face_mesh.FaceMesh(
        static_image_mode=False,
        max_num_faces=1
    ) as face_mesh:

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        result = face_mesh.process(rgb)

        if not result.multi_face_landmarks:
            return False

        landmarks = result.multi_face_landmarks[0].landmark

        nose = landmarks[1]

        if nose.x < 0.4:
            return True

        if nose.x > 0.6:
            return True

        return False