from fastapi import FastAPI, APIRouter, Query
from fastapi.staticfiles import StaticFiles
from cachetools import TTLCache
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings, IMAGE_CACHE_DIR
from .collection.utils import parse_yaml_files, save_to_sqlite, fetch_media_details

from .collection.routes import (
    search_media,
    paginated_movies,
    paginated_shows,
    list_media_by_category,
    list_categories,
)

origins = ["*"]

app = FastAPI()

# Add the middleware to your application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Cache configuration
media_cache = TTLCache(maxsize=1000, ttl=3600)  # Cache for 1 hour
IMAGE_CACHE_DIR.mkdir(exist_ok=True)

# Serve cached images
app.mount("/images", StaticFiles(directory=IMAGE_CACHE_DIR), name="images")


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
def search(
    query: str,
    page: int = Query(1, alias="page", ge=1),
    page_size: int = Query(10, alias="page_size", ge=1, le=100),
):
    return search_media(query, page, page_size)


@prefix_router.get("/movies")
def get_movies(
    page: int = Query(1, alias="page", ge=1),
    page_size: int = Query(10, alias="page_size", ge=1, le=100),
):
    return paginated_movies(page, page_size)


@prefix_router.get("/shows")
def get_shows(
    page: int = Query(1, alias="page", ge=1),
    page_size: int = Query(10, alias="page_size", ge=1, le=100),
):
    return paginated_shows(page, page_size)


@prefix_router.get("/categories/")
def get_categories(
    page: int = Query(1, alias="page", ge=1),
    page_size: int = Query(10, alias="page_size", ge=1, le=100),
):
    return list_categories(page, page_size)


@prefix_router.get("/categories/{category_name}")
def get_category_details(
    category_name: str,
    page: int = Query(1, alias="page", ge=1),
    page_size: int = Query(10, alias="page_size", ge=1, le=100),
):
    return list_media_by_category(category_name, page, page_size)


app.include_router(prefix_router)
