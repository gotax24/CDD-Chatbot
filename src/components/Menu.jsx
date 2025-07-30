import useAuth from "../hooks/useAuth.jsx";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient.js";

const Menu = () => {
  const { role, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error al cerrar sesión:", error);
    } else {
      navigate("/");
    }
  };

  return (
    <header className="header-menu">
      <img src="/Logo-CDDmcbo.webp" alt="Logo de CDD Maracaibo" />
      <h1 className="title-menu">
        Bienvenido {profile && profile.first_name} al portal de CDD Maracaibo
      </h1>
      <nav className="nav-menu">
        <ul className="ul-menu">
          <li className="li-menu">
            <Link to="/app/home">Inicio</Link>
          </li>
          {(role === "sender" || role === "admin") && (
            <>
              <li className="li-menu">
                <Link to="/app/report">Informes</Link>
              </li>
              <li className="li-menu">
                <Link to="/app/marketing">Marketing</Link>
              </li>
            </>
          )}
          {role === "admin" && (
            <li className="li-menu">
              <Link to="/app/admin">Panel de Administrador</Link>
            </li>
          )}
          <li className="li-menu">
            <button onClick={handleLogout}>Cerrar sesión</button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Menu;
