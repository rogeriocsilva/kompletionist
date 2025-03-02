import { AxiosResponse } from "axios";
import http from "./http";
import {
  IPaginatedResponse,
  IPaginationFilters,
  ISearchFilters,
} from "./types";
import { IShow } from "@/types";

export function getShows(
  params: IPaginationFilters & ISearchFilters
): Promise<AxiosResponse<IPaginatedResponse<IShow>>> {
  return http.get("/shows", { params });
}
