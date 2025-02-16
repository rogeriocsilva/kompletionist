import { useState, useEffect } from "react";

import MediaSearch from "./MediaSearch";

import placeholder from "./assets/placeholder.jpg";
import { useCollection, useRequestMedia } from "./api";

const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w500/";
const TVDB_IMAGE_URL = "https://www.thetvdb.com/banners/";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debounceValue, setDebounceValue] = useState("");

  const { data, isError, isLoading } = useCollection();
  const { mutate: requestMediaFn, isLoading: isRequesting } = useRequestMedia();

  const renderPoster = (item) => {
    if (item.tmdbDetails && item.tmdbDetails.poster_path) {
      return (
        <img
          src={`${TMDB_IMAGE_URL}${item.tmdbDetails.poster_path}`}
          alt={item.title}
          className="w-full h-64 object-cover mb-2 rounded-t-lg"
        />
      );
    }

    if (item.tvdbDetails && item.tvdbDetails.poster) {
      return (
        <img
          src={`${TVDB_IMAGE_URL}${item.tvdbDetails.poster}`}
          alt={item.title}
          className="w-full h-64 object-cover mb-2 rounded-t-lg"
        />
      );
    }

    return (
      <img
        src={placeholder}
        alt="No poster available"
        className="w-full h-64 object-cover mb-2 rounded-t-lg"
      />
    );
  };

  const requestMedia = async (item) => {
    await requestMediaFn(item);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(debounceValue);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [debounceValue]);

  const handleChange = (event) => {
    const searchTerm = event.target.value;
    setDebounceValue(searchTerm);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-4xl font-bold mb-4">Kompletionist</h1>
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-4">
        <h1 className="text-4xl font-bold mb-4">Kompletionist</h1>
        <p className="text-lg text-red-500">Error fetching data</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-4">Kompletionist</h1>

      <input
        type="text"
        value={debounceValue}
        onChange={handleChange}
        placeholder="Search for a movie or TV show"
        className="border p-2 rounded w-full mb-4"
      />

      {searchTerm?.length > 3 ? (
        <MediaSearch searchTerm={searchTerm} />
      ) : (
        <>
          {Object.entries(data).map(([type, items]) => (
            <div key={type} className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">{type}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.values(items)
                  .slice(0, 50)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="relative border border-gray-300 rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-all grid grid-rows-[auto,auto,1fr]"
                    >
                      {renderPoster(item)}

                      <h3 className="text-lg font-semibold px-2 py-1">
                        {item.title}
                      </h3>

                      <h5 className="text-lg font-semibold px-2 py-1">
                        {item.collections.join(", ")}
                      </h5>

                      {!item.overseerrStatus && (
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition-colors w-full h-12 mt-auto cursor-pointer bg:disabled:bg-gray-500 bg:disabled:hover:bg-gray-500 bg:disabled:cursor-not-allowed disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-500 disabled:bg-red-500"
                          onClick={() => requestMedia(item)}
                          disabled={isRequesting}
                        >
                          Request
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;
