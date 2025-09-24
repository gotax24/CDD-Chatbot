import useAuth from "../hooks/useAuth.jsx";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient.js";
import iconLogout from "../assets/menu/logOut.svg";
import iconReport from "../assets/menu/report.svg";
import iconHome from "../assets/menu/iconHome.svg";
import iconMarketing from "../assets/menu/iconMarketing.svg";
import iconAdmin from "../assets/menu/iconAdmin.svg";
import "../css/Menu.css";

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
              <div className="div-icon-menu">
                <img src={iconHome} alt="Icono de inicio" />
              </div>
              <div className="div-link-menu">
                <Link to="/app/home">Inicio</Link>
              </div>
            </li>
            {(user?.profile?.role === "sender" ||
              user?.profile?.role === "admin") && (
              <>
                <li className="li-menu">
                  <div className="div-icon-menu">
                    <img src={iconReport} alt="Icono de informes" />
                  </div>
                  <div className="div-link-menu">
                    <Link to="/app/reports">Informes</Link>
                  </div>
                </li>

                <li className="li-menu">
                  <div className="div-icon-menu">
                    <img src={iconMarketing} alt="Icono de marketing" />
                  </div>
                  <div className="div-link-menu">
                    <Link to="/app/marketing">Marketing</Link>
                  </div>
                </li>
              </>
            )}
            {user?.profile?.role === "admin" && (
              <li className="li-menu">
                <div className="div-icon-menu">
                  <img src={iconAdmin} alt="icono de admin" />
                </div>
                <div className="div-link-menu">
                  <Link to="/app/admin">Panel de Administrador</Link>
                </div>
              </li>
            )}
            <li className="li-menu">
              <div className="div-icon-menu">
                <img src={iconLogout} alt="Icono de cerrar cesion" />
              </div>
              <div className="div-button-link">
                <button onClick={handleLogout}>Cerrar sesión</button>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Menu;
