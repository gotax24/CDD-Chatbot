import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Loading from "../components/Loading";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const getUsers = async () => {
      const { data, error } = await supabase.from("profiles").select("*");

      if (error) {
        console.error("Error al obtener usuarios:", error.message);
        setLoading(false);
      } else {
        setUsers(data);
      }
      setLoading(false);
    };

    getUsers();
  }, []);

  if (user.profile.role !== "admin") {
    return <Navigate to="/app/home" replace />;
  }

  if (loading) return <Loading />;

  return (
    <>
      <header>
        <h1>Gestión de usuarios</h1>
        <button>Agregar Usuario</button>
      </header>
      <main>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Nombre y Apellido</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{`${user.first_name} ${user.last_name}`}</td>
                <td>{user.role}</td>
                <td>
                  <button>Editar</button>
                  <button>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
};

export default UserManagement;
