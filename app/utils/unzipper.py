import zipfile
import os
import shutil

TEMP_FOLDER = "app/temp"


def extract_zip(zip_file, share_code):

    # clear temp folder
    if os.path.exists(TEMP_FOLDER):
        shutil.rmtree(TEMP_FOLDER)

    os.makedirs(TEMP_FOLDER, exist_ok=True)

    if not zipfile.is_zipfile(zip_file):
        raise Exception("Uploaded file is not a valid ZIP")

    try:

        with zipfile.ZipFile(zip_file) as zip_ref:

            for member in zip_ref.namelist():

                if member.endswith(".xml"):

                    zip_ref.extract(
                        member,
                        TEMP_FOLDER,
                        pwd=share_code.encode()
                    )

                    return os.path.join(TEMP_FOLDER, member)

        raise Exception("Aadhaar XML not found")

    except RuntimeError:

        raise Exception("Invalid Aadhaar share code")