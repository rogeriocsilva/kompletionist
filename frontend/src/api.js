import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";

const API_URL = "http://localhost:5001/api";

async function getCollection() {
  const response = await axios.get(`${API_URL}/collections`);
  return response.data;
}

async function requestMedia(item) {
  return await axios.post(`${API_URL}/request`, {
    mediaId: item.id,
    mediaType: item.tvdbDetails ? "show" : "movie",
  });
}

async function searhMedia(query) {
  const response = await axios.get(`${API_URL}/search?query=${query}`);
  return response.data;
}

export function useCollection() {
  return useQuery({ queryKey: ["collection"], queryFn: getCollection });
}

export function useRequestMedia() {
  return useMutation({ mutationFn: requestMedia });
}

export function useSearchMedia(query) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searhMedia(query),
    enabled: Boolean(query),
  });
}
