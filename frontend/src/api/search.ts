import http from "./http";
import { IPaginatedResponse, IMedia } from "./types";

export function search(query: string): Promise<IPaginatedResponse<IMedia>> {
  return http.get(`/search?q=${query}`);
}
