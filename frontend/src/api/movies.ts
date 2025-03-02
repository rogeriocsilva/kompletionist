import { AxiosResponse } from "axios";
import http from "./http";
import { IPaginatedResponse, IPaginationFilters } from "./types";
import { IMovie } from "@/types";

export async function getMovies(
  params: IPaginationFilters
): Promise<AxiosResponse<IPaginatedResponse<IMovie>>> {
  return await http.get("/movies", { params });
}
