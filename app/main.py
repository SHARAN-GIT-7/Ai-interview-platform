from fastapi import FastAPI

from app.routes import aadhaar_routes
from app.routes import face_routes
from app.routes import interview_routes
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(aadhaar_routes.router)
app.include_router(face_routes.router)
app.include_router(interview_routes.router)