# kompletionist

(instructions given to chatgpt to start the project)

## Backend:

The backend will be responsible for:

- Reading the YAML files from a directory on startup.
- Parsing and organizing the data into collections (e.g., IMDb Popular TV, IMDb Top 250).
- Only processing collections with valid data (TMDb or TVDb IDs).
- Storing the data in a cache to avoid repeated reads.
- Returning the data grouped by collection.
- Integrating with TMDb to fetch details about movies and TV shows.
- Caching images and serving them to the frontend.
- Integrating with Overseerr to check availability and request movies/shows.
- Enabling keyword search functionality.

## Frontend:

The frontend will have the following objectives:

- Receive and display collections and the available or missing movies/shows.
- Group collections into sections like "IMDb Popular TV", "IMDb Top 250", etc.
- Display posters of the movies and shows.
- Allow searching for a movie/show.
- Include an option to request media if it is unavailable through the server.
