export interface IPaginationFilters {
  page: number | null;
  page_size: number | null;
}

export interface ISearchFilters {
  search_query: string | null;
}

export interface IPaginatedHook {
  loading: boolean;
  error: boolean;
  total: number;
  total_pages: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export enum PAGE_SIZE {
  TEN = "10",
  FIFTY = "50",
  HUNDRED = "100",
}
