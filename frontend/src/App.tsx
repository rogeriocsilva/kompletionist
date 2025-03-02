import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import Movies from "@/pages/Movies";
import NotFound from "@/pages/NotFound";
import Shows from "./pages/Shows";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<Movies />} path="/movies" />
      <Route element={<Shows />} path="/shows" />
      <Route element={<NotFound />} path="*" />
    </Routes>
  );
}

export default App;
