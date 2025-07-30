import { Link, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { CircleUserRound } from "lucide-react";

const PanelAdmin = () => {
  const { role, profile } = useAuth();

  if (role !== "admin") {
    return <Navigate to="/app/home" replace />;
  }

  return (
    <>
      <header>
        <h1>
          Bienvenido {profile && profile.first_name} al Panel de Administracion
        </h1>
      </header>
      <Link to="admin/users">
        <div className="card-admin">
          <CircleUserRound />
          <h2>Gestion de usuarios</h2>
        </div>
      </Link>
      <div>
        <h2>Gestion de Informes</h2>
        <button>Cargar informe</button>
        <button>Ver informes</button>
      </div>
      <div>
        <h2>Roles</h2>
        <button>Agregar rol</button>
        <button>Editar rol</button>
        <button>Eliminar rol</button>
        <button>Ver roles</button>
      </div>
      <div>
        <h2>Gestion de pacientes</h2>
        <button>Agregar paciente</button>
        <button>Editar paciente</button>
        <button>Eliminar paciente</button>
        <button>Ver pacientes</button>
      </div>
    </>
  );
};

export default PanelAdmin;
