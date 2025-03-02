import { useEffect, useState } from "react";
import { Pagination } from "@heroui/pagination";

import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { MediaCard } from "@/components/MediaCard";
import { useShows } from "@/hooks/useShows";
import { PAGE_SIZE } from "@/api/types";
import { SearchIcon } from "@/components/icons";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";

const timeout = 500;

export default function Shows() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE.TEN);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, timeout);
    return () => clearTimeout(timeoutId);
  }, [search, timeout]);

  const { shows, total_pages, loading, error } = useShows({
    page: currentPage,
    pageSize: Number(pageSize),
    searchQuery: debouncedSearch,
  });

  if (loading) {
    return <DefaultLayout>Loading...</DefaultLayout>;
  }
  if (error) {
    return <DefaultLayout>Error...</DefaultLayout>;
  }

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-4">
        <h1 className={title()}>Shows</h1>
        <Input
          isClearable
          aria-label="Search"
          labelPlacement="outside"
          placeholder="Search..."
          startContent={
            <SearchIcon className="text-base text-default-500 pointer-events-none flex-shrink-0" />
          }
          type="search"
          className="bg-default"
          onValueChange={setSearch}
          value={search}
        />
        <div className="grid grid-cols-3 lg:grid-cols-5 grid-flow-row gap-4">
          {shows.map((show) => (
            <MediaCard media={show} key={show.id} />
          ))}
        </div>
        <Select
          className="max-w-xs"
          label="Page size"
          size="sm"
          // weird api, but ok
          selectedKeys={new Set([pageSize])}
          onSelectionChange={(e) => setPageSize(e.anchorKey as PAGE_SIZE)}
        >
          {Object.values(PAGE_SIZE).map((size) => (
            <SelectItem key={size}>{size}</SelectItem>
          ))}
        </Select>
        <Pagination
          showControls
          initialPage={currentPage}
          total={total_pages}
          onChange={setCurrentPage}
        />
      </div>
    </DefaultLayout>
  );
}
