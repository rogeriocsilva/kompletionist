from fastapi import Depends, FastAPI, HTTPException, Query

from typing import Annotated
from pathlib import Path
import yaml
import sqlite3
import aiohttp
import asyncio
import json
import hashlib
import aiosqlite

from ..config import get_settings

yaml_settings = dict()

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
                                                    parsed_movies[id] = {"title": title , "categories": []}
                                                if category not in parsed_movies[id]["categories"]:
                                                    parsed_movies[id]["categories"].append(category)
                                            elif subcategory.endswith("(TVDb IDs)"):
                                                if id not in parsed_shows:
                                                    parsed_shows[id] = {"title": title, "categories": []}
                                                if category not in parsed_shows[id]["categories"]:
                                                    parsed_shows[id]["categories"].append(category)
            except yaml.YAMLError:
                continue
    
    return parsed_movies, parsed_shows

def save_to_sqlite(movies, shows, db_path="parsed_data.db"):
    conn = sqlite3.connect(db_path, check_same_thread=False)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS movies (
            id TEXT PRIMARY KEY,
            title TEXT,
            categories TEXT,
            details TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS shows (
            id TEXT PRIMARY KEY,
            title TEXT,
            categories TEXT,
            details TEXT
        )
    """)
    
    for id, data in movies.items():
        cursor.execute("INSERT OR REPLACE INTO movies (id, title, categories) VALUES (?, ?, ?)", 
                       (id, data["title"], json.dumps(data["categories"])))
    
    for id, data in shows.items():
        cursor.execute("INSERT OR REPLACE INTO shows (id, title, categories) VALUES (?, ?, ?)", 
                       (id, data["title"], json.dumps(data["categories"])))
    
    conn.commit()
    conn.close()

async def fetch_json(session, url, headers=None):
    async with session.get(url, headers=headers) as response:
        if response.status == 200:
            return await response.json()
        return None

SEM = asyncio.Semaphore(5)  # Limit concurrent requests to prevent rate-limiting

async def fetch_json(session, url, headers=None):
    """Fetch JSON data from a URL with error handling."""
    async with SEM:
        try:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    return await response.json()
                return None
        except aiohttp.ClientError:
            return None

async def fetch_tmdb_details(session, movie_id):
    """Fetch movie details from TMDb API."""
    settings = get_settings()

    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={settings.tmdb_api_key}&language=en-US"
    return await fetch_json(session, url)

async def fetch_tvdb_details(session, show_id):
    """Fetch TV show details from TVDb API."""
    settings = get_settings()

    url = f"https://api4.thetvdb.com/v4/series/{show_id}"
    headers = {"Authorization": f"Bearer {settings.tvdb_api_key}"}
    return await fetch_json(session, url, headers=headers)

async def fetch_media_details():
    """Fetch details for movies and shows asynchronously and update SQLite."""
    async with aiosqlite.connect("parsed_data.db") as db:
        async with db.execute("SELECT id FROM movies WHERE details IS NULL") as cursor:
            movie_ids = [row[0] for row in await cursor.fetchall()]
        async with db.execute("SELECT id FROM shows WHERE details IS NULL") as cursor:
            show_ids = [row[0] for row in await cursor.fetchall()]

    async with aiohttp.ClientSession() as session:
        movie_tasks = [fetch_tmdb_details(session, movie_id) for movie_id in movie_ids]
        show_tasks = [fetch_tvdb_details(session, show_id) for show_id in show_ids]

        movie_results = await asyncio.gather(*movie_tasks)
        show_results = await asyncio.gather(*show_tasks)

    async with aiosqlite.connect("parsed_data.db") as db:
        for movie_id, details in zip(movie_ids, movie_results):
            if details:
                await db.execute("UPDATE movies SET details = ? WHERE id = ?", (json.dumps(details), movie_id))

        for show_id, details in zip(show_ids, show_results):
            if details:
                await db.execute("UPDATE shows SET details = ? WHERE id = ?", (json.dumps(details), show_id))

        await db.commit()

def paginated_movies(page, per_page):
    conn = sqlite3.connect("parsed_data.db", check_same_thread=False)
    cursor = conn.cursor()

    offset = (page - 1) * per_page
    cursor.execute("SELECT id, title, categories, details FROM movies LIMIT ? OFFSET ?", (per_page, offset))
    movies = cursor.fetchall()

    conn.close()

    return {"movies": [{"id": row[0], "title": row[1], "categories": json.loads(row[2]), "details": json.loads(row[3]) if row[3] else None} for row in movies]}

def paginated_shows(page, per_page):
    conn = sqlite3.connect("parsed_data.db", check_same_thread=False)
    cursor = conn.cursor()

    offset = (page - 1) * per_page
    cursor.execute("SELECT id, title, categories, details FROM shows LIMIT ? OFFSET ?", (per_page, offset))
    shows = cursor.fetchall()

    conn.close()

    return {"shows": [{"id": row[0], "title": row[1], "categories": json.loads(row[2]), "details": json.loads(row[3]) if row[3] else None} for row in shows]}

def search_media(query: str):
    conn = sqlite3.connect("parsed_data.db", check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM movies WHERE title LIKE ?", (f"%{query}%",))
    movies = cursor.fetchall()
    cursor.execute("SELECT * FROM shows WHERE title LIKE ?", (f"%{query}%",))
    shows = cursor.fetchall()
    conn.close()
    return {"movies": {"movies": [{"id": row[0], "title": row[1], "categories": json.loads(row[2]), "details": json.loads(row[3]) if row[3] else None} for row in movies]}, "shows": [{"id": row[0], "title": row[1], "categories": json.loads(row[2]), "details": json.loads(row[3]) if row[3] else None} for row in shows]}
