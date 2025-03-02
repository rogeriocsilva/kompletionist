import { useQuery } from "@tanstack/react-query";

import { getMovies } from "@/api/movies";
import { IPaginatedHook } from "@/api/types";
import { IMovie } from "@/types";

interface IMoviesHook extends IPaginatedHook {
  movies: IMovie[];
}

interface IMoviesHookProps {
  page: number;
}

export function useMovies({ page }: IMoviesHookProps): IMoviesHook {
  const { data, isFetching, isError } = useQuery({
    queryKey: ["movies", page],
    queryFn: () => getMovies({ page: page, page_size: 9 }),
    select: ({ data }) => data,
  });

  const movies = data?.data ?? [];
  const total = data?.total ?? 0;
  const total_pages = data?.total_pages ?? 0;

  return {
    movies,
    loading: isFetching,
    error: isError,
    total,
    total_pages,
  };
}
