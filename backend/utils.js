import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const YAML_DIR = process.env.YAML_DIR;
const CACHE_PATH = `${process.env.CACHE_PATH}.json`;

export const getCachedData = async () => {
  if (!fs.existsSync(CACHE_PATH)) {
    console.log("Cache not found");
    const data = await parseYAML();
    fs.writeFileSync(CACHE_PATH, JSON.stringify(data));
    return data;
  }

  console.log("Cache found");
  const cachedData = fs.readFileSync(CACHE_PATH, "utf8");
  return JSON.parse(cachedData);
};

export const parseYAML = async () => {
  const files = fs.readdirSync(YAML_DIR);
  const data = {};

  for (const file of files) {
    if (file.endsWith(".yml")) {
      const filePath = path.join(YAML_DIR, file);
      const fileData = fs.readFileSync(filePath, "utf8");

      try {
        const parsedData = yaml.load(fileData);
        console.log(`parsing ${file}`);

        // Filtra e organiza os dados válidos
        const groupedItems = await groupItems(parsedData);
        if (Object.keys(groupedItems).length > 0) {
          data[file] = groupedItems;
        }
      } catch (error) {
        console.error(`error parsing ${file}`, error);
      }
    }
  }

  fs.writeFileSync(CACHE_PATH, JSON.stringify(data));
  return data;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Função para agrupar os itens de cada colecção (filmes e séries)
const groupItems = async (parsedData) => {
  const groupedItems = {};

  for (const collection in parsedData) {
    const collectionData = parsedData[collection];
    const validCollection = {};

    if (collectionData["Movies Missing (TMDb IDs)"]) {
      validCollection["Movies Missing"] = await Promise.all(
        Object.entries(collectionData["Movies Missing (TMDb IDs)"])
          .filter(([id, title]) => id && title)
          .map(async ([id, title]) => {
            await sleep(1_000);

            return {
              id: id,
              title: title,
              tmdbDetails: await getMovieDetailsFromTMDb(id),
            };
          })
      );
    }
    if (collectionData["Shows Missing (TVDb IDs)"]) {
      validCollection["Shows Missing"] = await Promise.all(
        Object.entries(collectionData["Shows Missing (TVDb IDs)"])
          .filter(([id, title]) => id && title)
          .map(async ([id, title]) => {
            await sleep(1_000);

            return {
              id: id,
              title: title,
              tvdbDetails: await getShowDetailsFromTVDb(id).data,
            };
          })
      );
    }

    if (Object.keys(validCollection).length > 0) {
      groupedItems[collection] = validCollection;
    }
  }

  return groupedItems;
};

export const getMovieDetailsFromTMDb = async (tmdbId) => {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  const TMDB_API_URL = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`;

  try {
    const response = await axios.get(TMDB_API_URL);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${tmdbId} TMDb details:`, error.status);
    return null;
  }
};

export const getShowDetailsFromTVDb = async (tvdbId) => {
  // Set up the base URL for TVDb
  const TVDB_API_URL = "https://api.thetvdb.com";
  const TVDB_API_KEY = process.env.TVDB_API_KEY; // Store your TVDb API key in the .env file

  try {
    const response = await axios.get(`${TVDB_API_URL}/series/${tvdbId}`, {
      headers: {
        Authorization: `Bearer ${TVDB_API_KEY}`,
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${tvdbId} TVDb details:`, error.status);
    return null;
  }
};

export const searchInData = (data, keyword) => {
  const results = [];
  for (const collection in data) {
    for (const category in data[collection]) {
      if (data[collection][category]["Movies Missing"]) {
        data[collection][category]["Movies Missing"].forEach((item) => {
          console.log(item.title);
          if (item.title.toLowerCase().includes(keyword.toLowerCase())) {
            results.push(item);
          }
        });
      }
      if (data[collection][category]["Shows Missing"]) {
        data[collection][category]["Shows Missing"].forEach((item) => {
          if (item.title.toLowerCase().includes(keyword.toLowerCase())) {
            results.push(item);
          }
        });
      }
    }
  }
  return results;
};
