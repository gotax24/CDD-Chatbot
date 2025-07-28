import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient.js";
import { Link } from "react-router-dom";

const Menu = () => {
  const { session, profile, role } = useAuth();
  const navigate = useNavigate();

  console.log("Session in Menu:", profile);

  if (!session) {
    return navigate("/");
  }

  const handleLogout = async () => {
    // Aquí puedes manejar el cierre de sesión, por ejemplo, con Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error al cerrar sesión:", error);
    } else {
      navigate("/");
    }
  };

  return (
    <header className="header-menu">
      <img src="../public/Logo-CDDmcbo.webp" alt="Logo de CDD Maracaibo" />
      <h1 className="title-menu">Bienvenido a CDD Maracaibo</h1>
      <nav className="nav-menu">
        <ul>
          <li>
            <Link to="/app/home">Inicio</Link>
          </li>
          {role === "sender" && (
            <>
              <li>
                <Link to="/app/send">Enviar informes</Link>
              </li>
              <li>
                <Link to="/app/marketing">Enviar Marketing</Link>
              </li>
            </>
          )}
          {role === "admin" && (
            <li>
              <Link to="/app/admin">Panel de Admin</Link>
            </li>
          )}
          <li>
            <button onClick={handleLogout}>Cerrar sesión</button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Menu;
