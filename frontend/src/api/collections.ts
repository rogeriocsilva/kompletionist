import http from "./http";
import { IMedia, IPaginatedResponse } from "./types";

export function getCollections(): Promise<IPaginatedResponse<string>> {
  return http.get("/collections");
}

export function getCollectionsByName(
  name: string
): Promise<IPaginatedResponse<IMedia>> {
  return http.get(`/collections/${name}`);
}
