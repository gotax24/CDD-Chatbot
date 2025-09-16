import useAuth from "../hooks/useAuth.jsx";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient.js";

const Menu = () => {
  const { user } = useAuth();
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
      <div className="div-menu-logo">
        <img src="/Logo-CDDmcbo.webp" alt="Logo de CDD Maracaibo" />
      </div>

      <div className="div-menu-links">
        <nav className="nav-menu">
          <ul className="ul-menu">
            <li className="li-menu">
              <Link to="/app/home">Inicio</Link>
            </li>
            {(user.profile.role === "sender" ||
              user.profile.role === "admin") && (
              <>
                <li className="li-menu">
                  <Link to="/app/reports">Informes</Link>
                </li>

                <li className="li-menu">
                  <Link to="/app/marketing">Marketing</Link>
                </li>
              </>
            )}
            {user.profile.role === "admin" && (
              <li className="li-menu">
                <Link to="/app/admin">Panel de Administrador</Link>
              </li>
            )}
            <li className="li-menu">
              <button onClick={handleLogout}>Cerrar sesión</button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Menu;
