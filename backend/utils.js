import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import axios from "axios";
import dotenv from "dotenv";

import { getShowDetailsFromTVDb } from "./tvdb";
import { getMovieDetailsFromTMDb } from "./tmdb";

dotenv.config();

const YAML_DIR = process.env.YAML_DIR;
const CACHE_PATH = `${process.env.CACHE_PATH}.json`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getCachedData() {
  try {
    if (!fs.existsSync(CACHE_PATH)) {
      console.log("Cache not found");
      const data = await parseYAML();

      if (data) {
        fs.writeFileSync(CACHE_PATH, JSON.stringify(data));
        return data;
      }

      return null;
    }

    console.log("Cache found");
    const cachedData = fs.readFileSync(CACHE_PATH, "utf8");
    return JSON.parse(cachedData);
  } catch (error) {
    console.error("Error reading cache:", error);
    return null;
  }
}

export async function parseYAML() {
  try {
    const files = fs.readdirSync(YAML_DIR);
    const data = { movies: {}, shows: {} };

    for (const file of files) {
      if (file.endsWith(".yml")) {
        const filePath = path.join(YAML_DIR, file);
        const fileData = fs.readFileSync(filePath, "utf8");

        try {
          const parsedData = yaml.load(fileData);
          console.log(`parsing ${file}`);

          await groupItems(parsedData, data);
        } catch (error) {
          console.error(`error parsing ${file}`, error);
        }
      }
    }

    fs.writeFileSync(CACHE_PATH, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("Error reading YAML files:", error);
    return null;
  }
}

async function groupItems(
  parsedData,
  groupedItems = { movies: {}, shows: {} }
) {
  for (const collection in parsedData) {
    const collectionData = parsedData[collection];

    if (collectionData["Movies Missing (TMDb IDs)"]) {
      await Promise.all(
        Object.entries(collectionData["Movies Missing (TMDb IDs)"])
          .filter(([id, title]) => id && title)
          .map(async ([id, title]) => {
            if (groupedItems.movies[id]?.collections) {
              groupedItems.movies[id].collections.push(collection);
            } else {
              groupedItems.movies[id] = {
                id: id,
                type: "movie",
                title: title,
                collections: [collection],
                tmdbDetails: await getMovieDetailsFromTMDb(id),
              };

              await sleep(5_000);
            }
          })
      );
    }

    if (collectionData["Shows Missing (TVDb IDs)"]) {
      await Promise.all(
        Object.entries(collectionData["Shows Missing (TVDb IDs)"])
          .filter(([id, title]) => id && title)
          .map(async ([id, title]) => {
            if (groupedItems.shows[id]?.collections) {
              groupedItems.shows[id].collections.push(collection);
            } else {
              groupedItems.shows[id] = {
                id: id,
                type: "show",
                title: title,
                collections: [collection],
                tvdbDetails: await getShowDetailsFromTVDb(id),
              };

              await sleep(5_000);
            }
          })
      );
    }
  }
  return groupedItems;
}

export function searchInData(data, keyword) {
  const results = [];

  for (const [type, items] of Object.entries(data)) {
    for (const item of Object.values(items)) {
      if (item.title.toLowerCase().includes(keyword.toLowerCase())) {
        results.push({ type, ...item });
      }
    }
  }

  return results;
}
