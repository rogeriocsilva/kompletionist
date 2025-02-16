const API_URL = "http://localhost:5001/api";

export const fetchMediaData = async () => {
  const response = await fetch(`${API_URL}/data`);
  const data = await response.json();

  return data.map((item) => ({
    ...item,
    posterPath: `${API_URL}/tmdb/poster/${item.id}?type=movie`, // Adjust this as needed
  }));
};
