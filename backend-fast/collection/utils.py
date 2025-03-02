from http.client import HTTPException
from pathlib import Path

import aiofiles
import aiohttp
import asyncio
import json
import yaml
import time

from ..config import (
    get_settings,
    get_db_connection,
    get_async_db_connection,
    IMAGE_CACHE_DIR,
)

yaml_settings = dict()


SEM = asyncio.Semaphore(5)  # Limit concurrent requests to prevent rate-limiting


# Cache for TVDB token with expiration
class TVDBTokenCache:
    def __init__(self):
        self.token = None
        self.expiry = 0  # Unix timestamp when token expires

    def set_token(self, token, expires_in=2592000):  # Default 30 days (in seconds)
        self.token = token
        self.expiry = time.time() + expires_in

    def get_token(self):
        if self.token and time.time() < self.expiry:
            return self.token
        return None

    def is_valid(self):
        return self.token is not None and time.time() < self.expiry


# Global token cache
token_cache = TVDBTokenCache()


async def ensure_valid_token():
    """Ensure we have a valid TVDB token, fetching a new one if needed."""
    if token_cache.is_valid():
        return token_cache.get_token()

    settings = get_settings()

    async with aiohttp.ClientSession() as session:
        url = "https://api4.thetvdb.com/v4/login"
        payload = {"apikey": settings.tvdb_api_key}

        # If using user-supported model, include PIN
        if hasattr(settings, "tvdb_pin") and settings.tvdb_pin:
            payload["pin"] = settings.tvdb_pin

        async with session.post(url, json=payload) as response:
            if response.status != 200:
                raise HTTPException(
                    status_code=401, detail="Failed to authenticate with TVDB API"
                )

            data = await response.json()
            token = data.get("data", {}).get("token")

            if token:
                # Cache the token (default 30 days validity)
                token_cache.set_token(token)
                return token

            raise HTTPException(status_code=401, detail="No token in TVDB response")


def parse_yaml_files(directory: str):
    path = Path(directory)
    if not path.is_dir():
        return {}, {}

    yaml_files = list(path.rglob("*.yaml")) + list(path.rglob("*.yml"))
    parsed_movies = {}
    parsed_shows = {}

    for yaml_file in yaml_files:
        with open(yaml_file, "r", encoding="utf-8") as file:
            try:
                content = yaml.safe_load(file)
                if isinstance(content, dict):
                    for category, subcategories in content.items():
                        if isinstance(subcategories, dict):
                            for subcategory, items in subcategories.items():
                                if isinstance(items, dict):
                                    for id, title in items.items():
                                        if isinstance(title, str):
                                            if subcategory.endswith("(TMDb IDs)"):
                                                if id not in parsed_movies:
                                                    parsed_movies[id] = {
                                                        "title": title,
                                                        "categories": [],
                                                        "type": "movie",
                                                    }
                                                if (
                                                    category
                                                    not in parsed_movies[id][
                                                        "categories"
                                                    ]
                                                ):
                                                    parsed_movies[id][
                                                        "categories"
                                                    ].append(category)
                                            elif subcategory.endswith("(TVDb IDs)"):
                                                if id not in parsed_shows:
                                                    parsed_shows[id] = {
                                                        "title": title,
                                                        "categories": [],
                                                        "type": "show",
                                                    }
                                                if (
                                                    category
                                                    not in parsed_shows[id][
                                                        "categories"
                                                    ]
                                                ):
                                                    parsed_shows[id][
                                                        "categories"
                                                    ].append(category)
            except yaml.YAMLError:
                continue

    return parsed_movies, parsed_shows


def save_to_sqlite(movies, shows):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS movies (
            id TEXT PRIMARY KEY,
            title TEXT,
            categories TEXT,
            details TEXT
        )
    """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS shows (
            id TEXT PRIMARY KEY,
            title TEXT,
            categories TEXT,
            details TEXT
        )
    """
    )

    for id, data in movies.items():
        cursor.execute(
            "INSERT OR REPLACE INTO movies (id, title, categories) VALUES (?, ?, ?)",
            (id, data["title"], json.dumps(data["categories"])),
        )

    for id, data in shows.items():
        cursor.execute(
            "INSERT OR REPLACE INTO shows (id, title, categories) VALUES (?, ?, ?)",
            (id, data["title"], json.dumps(data["categories"])),
        )

    conn.commit()
    conn.close()


async def fetch_json(session, url, headers=None):
    """Fetch JSON data from a URL with rate limiting."""
    async with SEM:
        try:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    return await response.json()
                print(f"Error fetching data from {url}, status: {response.status}")
        except aiohttp.ClientError:
            print(f"Error fetching data from {url}")
            pass
    return None


async def fetch_tvdb_json(session, url, headers=None):
    """Fetch JSON from URL."""
    async with SEM:
        try:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    return await response.json()
                elif response.status == 401:
                    # Token might be expired despite our cache thinking it's valid
                    # Force token refresh on next call
                    token_cache.set_token(None)
                    raise HTTPException(
                        status_code=401, detail="TVDB authentication failed"
                    )
                else:
                    raise HTTPException(
                        status_code=response.status,
                        detail=f"TVDB API error: {response.status}",
                    )
        except aiohttp.ClientError:
            print(f"Error fetching data from {url}")
            pass
    return None


async def fetch_tmdb_details(session, movie_id):
    """Fetch movie details from TMDb API."""
    settings = get_settings()

    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={settings.tmdb_api_key}&language=en-US"
    data = await fetch_json(session, url)

    if data and "poster_path" in data:
        data["cached_poster"] = await cache_poster(
            session, data["poster_path"], movie_id, "movie"
        )
    return data


async def fetch_tvdb_details(session, show_id):
    """Fetch TV show details from TVDb API."""
    token = await ensure_valid_token()

    url = f"https://api4.thetvdb.com/v4/series/{show_id}"
    headers = {"Authorization": f"Bearer {token}"}

    data = await fetch_tvdb_json(session, url, headers=headers)

    if data and "data" in data and "image" in data["data"]:
        data["cached_poster"] = await cache_poster(
            session, data["data"]["image"], show_id, "show"
        )
    return data


async def fetch_media_details():
    """Fetch and update media details, including poster caching."""
    async with get_async_db_connection() as db:
        async with db.execute("SELECT id FROM movies WHERE details IS NULL") as cursor:
            movie_ids = [row[0] for row in await cursor.fetchall()]
        async with db.execute("SELECT id FROM shows WHERE details IS NULL") as cursor:
            show_ids = [row[0] for row in await cursor.fetchall()]

    async with aiohttp.ClientSession() as session:
        movie_tasks = [fetch_tmdb_details(session, movie_id) for movie_id in movie_ids]
        show_tasks = [fetch_tvdb_details(session, show_id) for show_id in show_ids]

        movie_results = await asyncio.gather(*movie_tasks)
        show_results = await asyncio.gather(*show_tasks)

    async with get_async_db_connection() as db:
        for movie_id, details in zip(movie_ids, movie_results):
            if details:
                await db.execute(
                    "UPDATE movies SET details = ? WHERE id = ?",
                    (json.dumps(details), movie_id),
                )

        for show_id, details in zip(show_ids, show_results):
            if details:
                await db.execute(
                    "UPDATE shows SET details = ? WHERE id = ?",
                    (json.dumps(details), show_id),
                )

        await db.commit()


async def cache_poster(session, poster_url, media_id, media_type):
    """Download and cache movie/show posters locally."""
    if not poster_url:
        return None

    ext = Path(poster_url).suffix or ".jpg"
    filename = f"{media_type}_{media_id}{ext}"
    file_path = IMAGE_CACHE_DIR / filename

    if file_path.exists():
        return f"/images/{filename}"  # Return cached URL

    async with session.get(f"https://image.tmdb.org/t/p/w500{poster_url}") as response:
        if response.status == 200:
            async with aiofiles.open(file_path, "wb") as f:
                await f.write(await response.read())
            return f"/images/{filename}"

    return None
