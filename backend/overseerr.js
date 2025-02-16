import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const OVERSEERR_URL = process.env.OVERSEERR_URL;
const OVERSEERR_API_KEY = process.env.OVERSEERR_API_KEY;

async function checkOverseerrStatus(mediaId, status) {
  try {
    const response = await axios.get(`${OVERSEERR_URL}/requests`, {
      params: { mediaId, mediaType: status === "added" ? "movie" : "show" },
      headers: { "X-Api-Key": OVERSEERR_API_KEY },
    });
    return response.data.data.length > 0;
  } catch (error) {
    console.error("Error checking Overseerr status:", error);
    return false;
  }
}

export async function requestMediaInOverseerr(mediaId, mediaType) {
  try {
    const response = await axios.post(
      `${OVERSEERR_URL}/api/v1/request`,
      {
        mediaId: Number(mediaId),
        mediaType: mediaType,
      },
      {
        headers: { "X-Api-Key": OVERSEERR_API_KEY },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error requesting media from Overseerr:", error);
    throw new Error("Failed to request media");
  }
}
