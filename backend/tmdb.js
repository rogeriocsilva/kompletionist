import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function getMovieDetailsFromTMDb(tmdbId) {
  const TMDB_API_URL = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`;
  console.log(`Fetching ${tmdbId} TMDb details...`);

  try {
    const response = await axios.get(TMDB_API_URL);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching ${tmdbId} TMDb details:`,
      error.response?.status
    );
    return null;
  }
}

export { getMovieDetailsFromTMDb };
