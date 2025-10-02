//react-router
import { Link, Navigate } from "react-router-dom";
//hooks
import useAuth from "../hooks/useAuth";
//assets
import userCicle from "../assets/forms/user.svg";
import reportManage from "../assets/forms/reportManage.svg";
import patient from "../assets/forms/patient.svg";
//css
import "../CSS/PanelAdmin.css";

const PanelAdmin = () => {
  const { user } = useAuth();

  if (user.profile.role !== "admin") {
    return <Navigate to="/app/home" replace />;
  }

  return (
    <div className="panel-admin">
      <header className="panel-header">
        <h1>
          Bienvenido{" "}
          <span className="highlight">
            {user.profile && user.profile.first_name}
          </span>{" "}
          al Panel de Administración
        </h1>
      </header>

      <div className="admin-cards">
        <Link to="/app/admin/users" className="card-admin">
          <img src={userCicle} alt="Icono de usuario" />
          <h2>Gestión de Usuarios</h2>
        </Link>

        <Link to="/app/admin/reports" className="card-admin">
          <img src={reportManage} alt="Icono de reporte médico" />
          <h2>Gestión de Informes</h2>
        </Link>

        <Link to="/app/admin/patients" className="card-admin">
          <img src={patient} alt="Icono de hospital" />
          <h2>Gestión de Pacientes</h2>
        </Link>
      </div>
    </div>
  );
};

export default PanelAdmin;
