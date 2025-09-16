//dependecias
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
//Paginas del proyecto
import Home from "./Home.jsx";
import App from "./pages/App.jsx";
import SingIn from "./pages/SignIn.jsx";
import PanelAdmin from "./pages/PanelAdmin.jsx";
import Report from "./pages/Report.jsx";
import Marketing from "./pages/Marketing.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import ReportsManagement from "./pages/ReportsManagement.jsx";
import PatientsManagement from "./pages/PatientsManagement.jsx";
import Page404 from "./pages/Page404.jsx";
//autenticar y proteccion de rutas
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import "./main.css"

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
          <Route path="reports" element={<Report />} />
          <Route path="marketing" element={<Marketing />} />
          <Route path="admin" element={<PanelAdmin />} />
          <Route path="admin/users" element={<UserManagement />} />
          <Route path="admin/reports" element={<ReportsManagement />} />
          <Route path="admin/patients" element={<PatientsManagement />} />
        </Route>
        <Route path="*" element={<Page404 />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
