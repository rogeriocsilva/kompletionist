# kompletionist

Kompletionist reads Kometa (ex Plex media manager) missing reports and generates UI with them:

- list of missing movies
- list of missing shows
- list of collections
- showing which collections they belong to
- ability to search media
- ability to request them via overseer

(instructions given to chatgpt to start the project)

## Backend:

The backend will be responsible for:

- Reading the YAML files from a directory on startup.
- Parsing and grouping the data into movies/tv shows
- Only processing media with valid data (TMDb or TVDb IDs).
- Save categories where media is inserted (e.g., IMDb Popular TV, IMDb Top 250)
- Storing the data in a sqlite database to avoid repeated reads.
- Integrating with TMDb/TVDb to fetch details about movies and TV shows with delay to avoid 429 errors
- Caching images and serving them to the frontend.
- Integrating with Overseerr to check availability and request movies/shows.
- Enabling keyword search functionality.

## Frontend:

The frontend will have the following objectives:

- List of missing movies
- List of missing shows
- Display posters of the movies and shows.
- Allow searching for a movie/show.
- Receive and display collections and or missing movies/shows.
- Group collections into sections like "IMDb Popular TV", "IMDb Top 250", etc.
- Include an option to request media if it is unavailable through the server.
