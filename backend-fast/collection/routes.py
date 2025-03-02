from fastapi import HTTPException

import json

from ..config import get_db_connection


def paginated_movies(page: int, page_size: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, title, categories, details FROM movies",
    )
    movies = cursor.fetchall()

    conn.close()

    total = len(movies)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_movies = movies[start:end]

    return {
        "data": [
            {
                "id": row[0],
                "title": row[1],
                "categories": json.loads(row[2]),
                "details": json.loads(row[3]) if row[3] else None,
                "type": "movie",
            }
            for row in paginated_movies
        ],
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": (total // page_size) + (1 if total % page_size > 0 else 0),
    }


def paginated_shows(page: int, page_size: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, title, categories, details FROM shows",
    )
    shows = cursor.fetchall()

    conn.close()

    total = len(shows)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_shows = shows[start:end]

    return {
        "data": [
            {
                "id": row[0],
                "title": row[1],
                "categories": json.loads(row[2]),
                "details": json.loads(row[3]) if row[3] else None,
                "type": "show",
            }
            for row in paginated_shows
        ],
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": (total // page_size) + (1 if total % page_size > 0 else 0),
    }


def search_media(query: str, page: int, page_size: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM movies WHERE title LIKE ?", (f"%{query}%",))

    movies = [
        {
            "id": row[0],
            "title": row[1],
            "categories": json.loads(row[2]),
            "details": json.loads(row[3]) if row[3] else None,
            "type": "movie",
        }
        for row in cursor.fetchall()
    ]

    cursor.execute("SELECT * FROM shows WHERE title LIKE ?", (f"%{query}%",))

    shows = [
        {
            "id": row[0],
            "title": row[1],
            "categories": json.loads(row[2]),
            "details": json.loads(row[3]) if row[3] else None,
            "type": "show",
        }
        for row in cursor.fetchall()
    ]
    conn.close()

    # Merge movies & shows and apply pagination
    all_media = movies + shows
    total = len(all_media)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_media = all_media[start:end]

    return {
        "data": paginated_media,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": (total // page_size) + (1 if total % page_size > 0 else 0),
    }


def list_categories(page: int, page_size: int):
    """Fetch paginated list of unique categories."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT DISTINCT json_each.value FROM movies, json_each(movies.categories)"
    )
    movie_categories = {row[0] for row in cursor.fetchall()}

    cursor.execute(
        "SELECT DISTINCT json_each.value FROM shows, json_each(shows.categories)"
    )
    show_categories = {row[0] for row in cursor.fetchall()}

    conn.close()

    all_categories = sorted(movie_categories | show_categories)

    total = len(all_categories)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_categories = all_categories[start:end]

    return {
        "data": paginated_categories,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": (total // page_size) + (1 if total % page_size > 0 else 0),
    }


def list_media_by_category(
    category_name: str,
    page: int,
    page_size: int,
):
    """Fetch paginated movies and shows under a specific category."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Fetch all movies in the category
    cursor.execute(
        "SELECT * FROM movies WHERE ? IN (SELECT value FROM json_each(categories))",
        (category_name,),
    )
    all_movies = [
        {
            "id": row[0],
            "title": row[1],
            "categories": json.loads(row[2]),
            "details": json.loads(row[3]) if row[3] else None,
            "type": "movie",
        }
        for row in cursor.fetchall()
    ]

    # Fetch all shows in the category
    cursor.execute(
        "SELECT * FROM shows WHERE ? IN (SELECT value FROM json_each(categories))",
        (category_name,),
    )
    all_shows = [
        {
            "id": row[0],
            "title": row[1],
            "categories": json.loads(row[2]),
            "details": json.loads(row[3]) if row[3] else None,
            "type": "show",
        }
        for row in cursor.fetchall()
    ]

    conn.close()

    if not all_movies and not all_shows:
        raise HTTPException(status_code=404, detail="Category not found or empty")

    # Merge movies & shows and apply pagination
    all_media = all_movies + all_shows
    total = len(all_media)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_media = all_media[start:end]

    return {
        "data": paginated_media,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": (total // page_size) + (1 if total % page_size > 0 else 0),
    }
