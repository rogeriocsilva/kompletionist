import { AxiosResponse } from "axios";
import http from "./http";
import {
  IPaginatedResponse,
  IPaginationFilters,
  ISearchFilters,
} from "./types";
import { IMovie } from "@/types";

export async function getMovies(
  params: IPaginationFilters & ISearchFilters
): Promise<AxiosResponse<IPaginatedResponse<IMovie>>> {
  return await http.get("/movies", { params });
}
