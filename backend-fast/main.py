from functools import lru_cache
from typing import Union, Annotated
from fastapi import Depends, FastAPI, APIRouter, Query
from pathlib import Path
import asyncio

from fastapi.staticfiles import StaticFiles
from cachetools import TTLCache

from .config import Settings, get_settings
from .collection.read_collection import parse_yaml_files, save_to_sqlite, fetch_media_details, search_media, paginated_movies, paginated_shows

app = FastAPI()

# Cache configuration
media_cache = TTLCache(maxsize=1000, ttl=3600)  # Cache for 1 hour
IMAGE_CACHE_DIR = Path("cached_images")
IMAGE_CACHE_DIR.mkdir(exist_ok=True)

# Serve cached images
app.mount("/images", StaticFiles(directory="cached_images"), name="images")

async def start_background_tasks():
    settings = get_settings()
    parsed_movies, parsed_shows = parse_yaml_files(settings.data_directory)
    save_to_sqlite(parsed_movies, parsed_shows)
    await fetch_media_details()
    

@app.on_event("startup")
async def load_yaml_data():
    await start_background_tasks()

prefix_router = APIRouter(prefix="/api")

@prefix_router.get("/")
def read_root():
    return {"Hello": "World"}

@prefix_router.get("/search")
def search(query: str):
    return search_media(query)

@prefix_router.get("/movies")
def get_movies(page: int = Query(1, alias="page", ge=1), per_page: int = Query(10, alias="per_page", ge=1, le=100)):
    return paginated_movies(page, per_page)

@prefix_router.get("/shows")
def get_shows(page: int = Query(1, alias="page", ge=1), per_page: int = Query(10, alias="per_page", ge=1, le=100)):
    return paginated_shows(page, per_page)

@prefix_router.get("/update_media_details/")
async def update_media_details():
    await fetch_media_details()
    return {"message": "Media details updated successfully."}

app.include_router(prefix_router)
