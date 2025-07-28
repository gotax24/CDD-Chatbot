import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import SingIn from "./components/SignIn.jsx";
import Home from "./home.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SingIn />} />
        <Route
          path="/app/"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        >
          <Route path="home" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
