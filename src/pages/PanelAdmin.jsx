import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PanelAdmin = () => {
  const { role } = useAuth();

  if (role !== "admin") {
    return <Navigate to="/app/home" replace />;
  }

  return (
    <>
      <header>
        <img src="" alt="" />
        <h1>Panel de Administrador</h1>
      </header>
      <main>
        <section>
          <button>Agregar usuario</button>
          <button>Editar usuario</button>
          <button>Eliminar usuario</button>
          <button>Ver usuarios</button>
        </section>
        <section>
          <h2>Ver Memoria/Storage</h2>
          <button>Cargar informe</button>
          <button>Ver informes</button>
        </section>
        <section>
          <h2>Ver Logs</h2>
          <button>Ver logs de actividad</button>
          <button>Ver logs de errores</button>
        </section>
        <section>
          <h2>Mensajes enviados </h2>
          <button>Ver mensajes</button>
        </section>
      </main>
    </>
  );
};

export default PanelAdmin;
