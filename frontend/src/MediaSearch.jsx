import { useState, useEffect } from "react";
import placeholder from "./assets/placeholder.jpg";

// Replace these with your actual API URLs or relevant fetch logic
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w500/";
const TVDB_IMAGE_URL = "https://www.thetvdb.com/banners/";
const API_URL = "http://localhost:5001/api";

// The component will search movies (TMDb) and TV shows (TVDb)
const MediaSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Search for movies and TV shows
  const searchMedia = async () => {
    setLoading(true);

    try {
      const data = await fetch(`${API_URL}/search/?keyword=${searchTerm}`); // API to search for movies (TMDb)
      const searchData = await data.json();

      setResults(searchData);
    } catch (error) {
      console.error("Error fetching media:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger search when the searchTerm changes
  useEffect(() => {
    if (searchTerm.length > 2) {
      // Trigger search when 3+ characters are entered
      const timeoutId = setTimeout(searchMedia, 500); // Add delay to optimize requests
      return () => clearTimeout(timeoutId); // Clean up timeout on re-render
    }
  }, [searchTerm]);

  // Display the posters for each movie or TV show
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

  return (
    <div className="p-4">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search for a movie or TV show"
        className="border p-2 rounded w-full mb-4"
      />

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {results.length > 0 ? (
            results.map((item, index) => (
              <div
                key={index}
                className="relative border border-gray-300 rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-all"
              >
                {renderPoster(item)}

                <h3 className="text-lg font-semibold px-2 py-1">
                  {item.title}
                </h3>

                {!item.overseerrStatus && (
                  <button className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition-colors">
                    Request
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>No results found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaSearch;
