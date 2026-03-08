import os
import json
import cv2

from app.utils.unzipper import extract_zip
from app.utils.parser import parse_aadhaar_xml
from app.utils.id_generator import generate_unique_id


AADHAAR_STORAGE = "app/storage/aadhaar"


def process_aadhaar(zip_file, share_code):

    xml_file = extract_zip(zip_file, share_code)

    data = parse_aadhaar_xml(xml_file)

    reference_id = data["reference_id"]

    unique_id = generate_unique_id(reference_id)

    user_folder = f"{AADHAAR_STORAGE}/{unique_id}"

    os.makedirs(user_folder, exist_ok=True)

    # Save Aadhaar Image
    aadhaar_path = f"{user_folder}/aadhaar.jpg"

    with open(aadhaar_path, "wb") as f:
        f.write(data["photo"])

    # Remove photo from json
    del data["photo"]

    # Save Aadhaar details
    json_path = f"{user_folder}/data.json"

    with open(json_path, "w") as f:
        json.dump(data, f, indent=4)

    return unique_id, data