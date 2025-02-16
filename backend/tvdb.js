import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const TVDB_API_KEY = process.env.TVDB_API_KEY;

export async function getShowDetailsFromTVDb(tvdbId) {
  const TVDB_API_URL = `https://api.thetvdb.com/series/${tvdbId}`;
  console.log(`Fetching ${tvdbId} TVDb details...`);

  try {
    const response = await axios.get(TVDB_API_URL, {
      headers: {
        Authorization: `Bearer ${TVDB_API_KEY}`,
        Accept: "application/json",
      },
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching ${tvdbId} TVDb details:`, error);
    return null;
  }
}
