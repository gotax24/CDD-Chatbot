import { createRoot } from "react-dom/client";
import { BrowserRouter, Route } from "react-router-dom";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Route path="/" element={<App />} />
  </BrowserRouter>
);
