from sqlalchemy import Column, String
from .db import Base

class User(Base):
    __tablename__ = "users"

    unique_id = Column(String, primary_key=True)

    masked_aadhaar = Column(String)

    name = Column(String)
    dob = Column(String)
    gender = Column(String)

    address = Column(String)
    state = Column(String)
    district = Column(String)
    pincode = Column(String)

    aadhaar_photo = Column(String)
    passport_photo = Column(String)

    embedding_path = Column(String)