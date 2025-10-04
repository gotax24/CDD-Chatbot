import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { supabase } from "../supabaseClient";
import iconHome from "../assets/menu/iconHome.svg";
import iconReport from "../assets/menu/report.svg";
import iconMarketing from "../assets/menu/iconMarketing.svg";
import iconAdmin from "../assets/menu/iconAdmin.svg";
import iconLogout from "../assets/menu/logOut.svg";
import "../CSS/Menu.css";

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
      {/* Logo */}
      <div className="div-menu-logo">
        <Link to="/app/home">
          <img
            className="logo-menu"
            src="/Logo-CDDmcbo.webp"
            alt="Logo de CDD Maracaibo"
          />
        </Link>
      </div>

      {/* Navegación */}
      <nav className="nav-menu">
        <ul className="ul-menu">
          <li className="li-menu">
            <Link to="/app/home" className="link-menu">
              <div className="div-icon-menu">
                <img src={iconHome} alt="Icono de inicio" />
              </div>
              <span>Inicio</span>
            </Link>
          </li>

          {(user?.profile?.role === "sender" ||
            user?.profile?.role === "admin") && (
            <>
              <li className="li-menu">
                <Link to="/app/reports" className="link-menu">
                  <div className="div-icon-menu">
                    <img src={iconReport} alt="Icono de informes" />
                  </div>
                  <span>Informes</span>
                </Link>
              </li>

              <li className="li-menu">
                <Link to="/app/marketing" className="link-menu">
                  <div className="div-icon-menu">
                    <img src={iconMarketing} alt="Icono de marketing" />
                  </div>
                  <span>Marketing</span>
                </Link>
              </li>
            </>
          )}

          {user?.profile?.role === "admin" && (
            <li className="li-menu">
              <Link to="/app/admin" className="link-menu">
                <div className="div-icon-menu">
                  <img src={iconAdmin} alt="Icono de admin" />
                </div>
                <span>Panel de Administrador</span>
              </Link>
            </li>
          )}

          <li className="li-menu">
            <button className="link-menu button-logout" onClick={handleLogout}>
              <div className="div-icon-menu">
                <img src={iconLogout} alt="Icono de cerrar sesión" />
              </div>
              <span>Cerrar sesión</span>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Menu;
