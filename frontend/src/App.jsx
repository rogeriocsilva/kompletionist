import { useEffect, useState } from "react";
import axios from "axios";

import MediaSearch from "./MediaSearch";

import placeholder from "./assets/placeholder.jpg";

const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w500/";
const TVDB_IMAGE_URL = "https://www.thetvdb.com/banners/";
const API_URL = "http://localhost:5001/api";

function App() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/collections`)
      .then((response) => {
        setCollections(response.data);
      })
      .catch((error) => console.error("Erro ao carregar coleções", error));
  }, []);

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
    try {
      setLoading(true);
      await axios.post(`${API_URL}/request`, {
        mediaId: item.id,
        mediaType: item.tvdbDetails ? "show" : "movie",
      });
      setLoading(false);
    } catch (error) {
      console.err(error);
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-4">Coleções de Filmes e Séries</h1>

      <MediaSearch />

      {Object.entries(collections).map(([collectionName, collectionData]) => (
        <div key={collectionName} className="mb-8">
          <h2 className="text-3xl font-semibold mb-4">{collectionName}</h2>
          {Object.entries(collectionData).map(([category, subCategories]) => (
            <div key={category} className="mb-4">
              <h3 className="text-2xl font-semibold">{category}</h3>
              <div className="">
                {Object.entries(subCategories).map(([subCategory, items]) => (
                  <div key={subCategory} className="mb-4">
                    <h3 className="text-xl font-semibold mb-2">
                      {subCategory}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {items.map((item, index) => (
                        <div
                          key={index}
                          className="relative border border-gray-300 rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-all"
                        >
                          {renderPoster(item)}

                          <h3 className="text-lg font-semibold px-2 py-1">
                            {item.title}
                          </h3>

                          {!item.overseerrStatus && (
                            <button
                              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition-colors"
                              onClick={() => requestMedia(item)}
                              disabled={loading}
                            >
                              Request
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default App;
