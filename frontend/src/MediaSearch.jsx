import PropTypes from "prop-types";

import placeholder from "./assets/placeholder.jpg";
import { useSearchMedia, useRequestMedia } from "./api";

const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w500/";
const TVDB_IMAGE_URL = "https://www.thetvdb.com/banners/";

const MediaSearch = (props) => {
  const { searchTerm } = props;

  const { data = [], isLoading, isError } = useSearchMedia(searchTerm);
  const { mutate: requestMediaFn, isLoading: isRequesting } = useRequestMedia();

  const renderPoster = (item) => {
    console.log(item.tmdbDetails);
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

  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (isError || !data.length) {
    return (
      <div className="p-4">
        <p className="text-lg">No results</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-4 gap-4">
        {data.map((item) => (
          <div
            key={item.id}
            className="relative border border-gray-300 rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-all grid grid-rows-[auto,auto,1fr]"
          >
            {renderPoster(item)}

            <h3 className="text-lg font-semibold px-2 py-1">{item.title}</h3>

            <h5 className="text-lg font-semibold px-2 py-1">
              {item.collections.join(", ")}
            </h5>

            {!item.overseerrStatus && (
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition-colors w-full h-12 mt-auto cursor-pointer bg:disabled:bg-gray-500 bg:disabled:hover:bg-gray-500 bg:disabled:cursor-not-allowed disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-500 disabled:bg-red-500"
                onClick={() => requestMedia(item)}
                disabled={isLoading || isRequesting}
              >
                Request
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
MediaSearch.propTypes = {
  searchTerm: PropTypes.string.isRequired,
};

export default MediaSearch;
