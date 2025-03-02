import { useState } from "react";
import { Pagination } from "@heroui/pagination";

import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { MediaCard } from "@/components/MediaCard";
import { useShows } from "@/hooks/useShows";

export default function Shows() {
  const [currentPage, setCurrentPage] = useState(1);

  const { shows, total_pages, loading, error } = useShows({
    page: currentPage,
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
        <div className="grid grid-cols-3 grid-flow-row gap-4">
          {shows.map((show) => (
            <MediaCard media={show} key={show.id} />
          ))}
        </div>
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
