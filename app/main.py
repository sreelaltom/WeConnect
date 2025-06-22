from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Local imports
from .database import engine
from .models import Base
from .routes import users, posts, comments
from .auth import router as auth_router

# Initialize FastAPI app
app = FastAPI(
    title="We Connect API",
    description="Social media API for We Connect platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production: specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the API"}

# Register routers
app.include_router(auth_router)
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(comments.router)