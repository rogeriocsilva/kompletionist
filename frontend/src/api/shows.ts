import { AxiosResponse } from "axios";
import http from "./http";
import { IPaginatedResponse, IPaginationFilters } from "./types";
import { IShow } from "@/types";

export function getShows(
  params: IPaginationFilters
): Promise<AxiosResponse<IPaginatedResponse<IShow>>> {
  return http.get("/shows", { params });
}
