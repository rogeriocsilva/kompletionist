import { useQuery } from "@tanstack/react-query";

import { getShows } from "@/api/shows";
import { IPaginatedHook } from "@/api/types";
import { IShow } from "@/types";

interface IShowsHook extends IPaginatedHook {
  shows: IShow[];
}

interface IShowsHookProps {
  page: number;
  pageSize: number;
  searchQuery: string | null;
}

export function useShows({
  page,
  pageSize,
  searchQuery,
}: IShowsHookProps): IShowsHook {
  const { data, isFetching, isError } = useQuery({
    queryKey: ["shows", page, pageSize, searchQuery],
    queryFn: () =>
      getShows({ page: page, page_size: pageSize, search_query: searchQuery }),
    select: ({ data }) => data,
  });

  const shows = data?.data ?? [];
  const total = data?.total ?? 0;
  const total_pages = data?.total_pages ?? 0;

  return {
    shows,
    loading: isFetching,
    error: isError,
    total,
    total_pages,
  };
}
