from fastapi import FastAPI, APIRouter, Query
from pathlib import Path

from fastapi.staticfiles import StaticFiles
from cachetools import TTLCache

from .config import get_settings
from .collection.read_collection import (
    parse_yaml_files,
    save_to_sqlite,
    fetch_media_details,
    search_media,
    paginated_movies,
    paginated_shows,
    list_media_by_category,
    list_categories,
)

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


@prefix_router.get("/search")
def search(query: str):
    return search_media(query)


@prefix_router.get("/movies")
def get_movies(
    page: int = Query(1, alias="page", ge=1),
    per_page: int = Query(10, alias="per_page", ge=1, le=100),
):
    return paginated_movies(page, per_page)


@prefix_router.get("/shows")
def get_shows(
    page: int = Query(1, alias="page", ge=1),
    per_page: int = Query(10, alias="per_page", ge=1, le=100),
):
    return paginated_shows(page, per_page)


@prefix_router.get("/categories/")
def get_categories(page: int = Query(1, ge=1), page_size: int = Query(10, le=100)):
    return list_categories(page, page_size)


@prefix_router.get("/categories/{category_name}")
def get_category_details(
    category_name: str, page: int = Query(1, ge=1), page_size: int = Query(10, le=100)
):
    return list_media_by_category(category_name, page, page_size)


app.include_router(prefix_router)
