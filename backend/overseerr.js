import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function checkOverseerrStatus(mediaId, status) {
  const url = `${process.env.OVERSEERR_URL}/requests`;
  try {
    const response = await axios.get(url, {
      params: { mediaId, mediaType: status === "added" ? "movie" : "show" },
      headers: { "X-Api-Key": process.env.OVERSEERR_API_KEY },
    });
    return response.data.data.length > 0;
  } catch (error) {
    console.error("Error checking Overseerr status:", error);
    return false;
  }
}

export async function requestMediaInOverseerr(mediaId, mediaType) {
  const OVERSEERR_API_URL = `${process.env.OVERSEERR_URL}/api/v1`; // Replace with your Overseerr API URL
  const OVERSEERR_API_KEY = process.env.OVERSEERR_API_KEY; // Ensure the API key is in your .env file

  try {
    // Media type should be either "movie" (for TMDb ID) or "show" (for TVDb ID)
    const response = await axios.post(
      `${OVERSEERR_API_URL}/request`,
      {
        mediaId: Number(mediaId), // TMDb ID for movies, TVDb ID for TV shows
        mediaType: mediaType, // Either "movie" for movies or "show" for TV shows
      },
      {
        headers: { "X-Api-Key": process.env.OVERSEERR_API_KEY },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error requesting media from Overseerr:", error);
    throw new Error("Failed to request media");
  }
}
