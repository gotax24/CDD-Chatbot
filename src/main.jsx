//dependecias
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
//Pagina y componentes del proyectos
import Home from "./Home.jsx";
import App from "./pages/App.jsx";
import SingIn from "./pages/SignIn.jsx";
import PanelAdmin from "./pages/PanelAdmin.jsx";
import Report from "./pages/Report.jsx";
import Marketing from "./pages/Marketing.jsx";
//autenticar y proteccion de rutas
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
          <Route path="report" element={<Report />} />
          <Route path="marketing" element={<Marketing />} />
          <Route path="admin" element={<PanelAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
