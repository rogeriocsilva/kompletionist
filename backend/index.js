import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import axios from "axios";
import yaml from "js-yaml";

import { getCachedData, searchInData, parseYAML } from "./utils";

import { requestMediaInOverseerr } from "./overseerr";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get("/api/search", async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: "query is required" });
  }

  try {
    const data = await getCachedData();
    if (data) {
      const results = searchInData(data, query);
      return res.json(results);
    }

    res.status(500).json({ error: "Searching error" });
  } catch (error) {
    console.error("Searching error:", error);
    res.status(500).json({ error: "Searching error" });
  }
});

app.get("/api/collections", async (req, res) => {
  try {
    const data = await getCachedData();

    if (data) {
      return res.json(data);
    }

    res.status(500).json({ error: "Processing error" });
  } catch (error) {
    console.error("Fetching error:", error);
    res.status(500).json({ error: "Processing error" });
  }
});

app.post("/api/request", async (req, res) => {
  const { mediaId, mediaType } = req.body; // Expecting mediaId and mediaType from request body

  if (!mediaId || !mediaType) {
    return res.status(400).json({
      success: false,
      message: "Media ID and media type are required.",
    });
  }

  try {
    const response = await requestMediaInOverseerr(mediaId, mediaType);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error("Requesting error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Iniciar o servidor
app.listen(PORT, async () => {
  await parseYAML();
  console.log(`Server started at http://localhost:${PORT}`);
});
