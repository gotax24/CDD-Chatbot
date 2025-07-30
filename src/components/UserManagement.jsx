import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Loading from "./Loading";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { role } = useAuth();

  useEffect(() => {
    setLoading(true);
    const getUsers = async () => {
      const { data, error } = await supabase.from("profiles").select(`
      id,
      username,
      first_name,
      last_name,
      users_roles (
        roles ( name )
      )
    `);
      if (error) {
        console.error("Error al obtener usuarios:", error.message);
        setLoading(false);
        return [];
      } else {
        setUsers(data);
      }

      // Los datos vienen anidados, así que los aplanamos para que sea más fácil usarlos.
      const formattedUsers = data.map((user) => ({
        ...user,
        role: user.users_roles[0]?.roles?.name || "Sin rol asignado", // Extrae el nombre del rol
      }));

      setLoading(false);
      return formattedUsers;
    };

    getUsers();
  }, []);

  if (role !== "admin") {
    return <Navigate to="/app/home" replace />;
  }

  if (loading) return <Loading />;

  return (
    <>
      <header>
        <h1>Gestion de usuarios</h1>
        <button>Agregar Usuario</button>
      </header>
      <main>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Nombre</th>
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
