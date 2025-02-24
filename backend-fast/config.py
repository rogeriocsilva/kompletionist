import sqlite3
import aiosqlite

from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings


def get_db_connection():
    return sqlite3.connect("parsed_data.db", check_same_thread=False)


def get_async_db_connection():
    return aiosqlite.connect("parsed_data.db")


@lru_cache
def get_settings():
    return Settings()


class Settings(BaseSettings):
    port: Optional[int] = 8000
    data_path: Optional[str] = "/data"

    tmdb_api_key: str
    tvdb_api_key: str
    overseerr_api_key: str
    overseerr_url: str = "http://overseerr:5055"

    class Config:
        env_file = ".env"
        extra = "allow"
        env_file_encoding = "utf-8"
        fields = {
            "tmdb_api_key": {"env": "TMDB_API_KEY"},
            "tvdb_api_key": {"env": "TVDB_API_KEY"},
            "port": {"env": "PORT"},
            "overseerr_url": {"env": "OVERSEERR_URL"},
            "overseerr_api_key": {"env": "OVERSEERR_API_KEY"},
            "data_directory": {"env": "DATA_DIRECTORY"},
        }
