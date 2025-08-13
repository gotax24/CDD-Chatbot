import { Link, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { CircleUserRound } from "lucide-react";

const PanelAdmin = () => {
  const { user } = useAuth();

  if (user.profile.role !== "admin") {
    return <Navigate to="/app/home" replace />;
  }

  return (
    <>
      <header>
        <h1>
          Bienvenido {user.profile && user.profile.first_name} al Panel de Administracion
        </h1>
      </header>
      <Link to="/app/admin/users">
        <div className="card-admin">
          <CircleUserRound />
          <h2>Gestion de usuarios</h2>
        </div>
      </Link>
      <Link to="/app/admin/reports">
        <span>icono</span>
        <h2>Gestion de Informes</h2>
        
      </Link>
      <div>
        <h2>Gestion de pacientes</h2>
      </div>
    </>
  );
};

export default PanelAdmin;
