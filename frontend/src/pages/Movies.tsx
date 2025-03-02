import { useState } from "react";
import { Pagination } from "@heroui/pagination";

import { title } from "@/components/primitives";
import { useMovies } from "@/hooks/useMovies";
import DefaultLayout from "@/layouts/default";
import { MediaCard } from "@/components/MediaCard";

export default function Movies() {
  const [currentPage, setCurrentPage] = useState(1);

  const { movies, total_pages, loading, error } = useMovies({
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
        <h1 className={title()}>Movies</h1>
        <div className="grid grid-cols-3 grid-flow-row gap-4">
          {movies.map((movie) => (
            <MediaCard media={movie} key={movie.id} />
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
