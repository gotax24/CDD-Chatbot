import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import useAuth from "../hooks/useAuth";
import useModalState from "../hooks/useModalState";
//componentes
import Modal from "../components/Modal";
import FormAddUser from "../components/FormAddUser";
import Loading from "../components/Loading";
import FormEditUser from "../components/FormEditUser";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [idUser, setIdUser] = useState(null);
  const { user } = useAuth();
  const { isOpen, openModal, closeModal } = useModalState();

  useEffect(() => {
    const getUsers = async () => {
      let { data, error } = await supabase.rpc("get_user_profiles");

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

  const deleteUser = async (idUser) => {
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { user_id: idUser },
      });

      if (error) throw error;

      console.log("Usuario eliminado", data);
      setUsers((prev) => prev.filter((u) => u.id !== idUser));
      setDeleting(false);
      handleCloseDeleteModal();
    } catch (error) {
      setDeleting(false);
      const errorMessage = error.context?.body?.error || error.message;

      console.error("Error al invocar la función:", errorMessage);
    }
  };

  const handleCloseDeleteModal = () => {
    setIdUser(null);
    closeModal("deleteUser");
  };

  if (user.profile.role !== "admin") {
    return <Navigate to="/app/home" replace />;
  }

  if (loading) return <Loading />;

  return (
    <>
      <header>
        <span>icono</span>
        <h1>Gestión de usuarios</h1>
      </header>
      <main>
        <button onClick={() => openModal("addUser")}>Agregar Usuario</button>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Username</th>
              <th>Nombre y Apellido</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.username}</td>
                <td>{`${user.first_name} ${user.last_name}`}</td>
                <td>{user.role}</td>
                <td>
                  <button>Editar</button>
                  <button
                    onClick={() => {
                      setIdUser(user.id), openModal("deleteUser");
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      <Modal
        isOpen={isOpen("addUser")}
        closeModal={() => closeModal("addUser")}
      >
        <FormAddUser closeModal={() => closeModal("addUser")} />
      </Modal>

      <Modal
        isOpen={isOpen("editUser")}
        closeModal={() => closeModal("editUser")}
      >
        <FormEditUser closeModal={() => closeModal("editUser")} />
      </Modal>

      <Modal isOpen={isOpen("deleteUser")} closeModal={handleCloseDeleteModal}>
        <>
          <header className="header-modal">
            <span className="icon-modal">icono</span>
            <h1 className="title-modal">Eliminar usuario</h1>
          </header>
          <main className="main-modal">
            <h2 className="confirm-modal">
              Estas seguro de eliminar el usuario?
            </h2>
            <button
              className="button-modal"
              disabled={deleting}
              onClick={() => deleteUser(idUser)}
            >
              {deleting ? "Eliminando..." : "Confirmar"}
            </button>
          </main>
        </>
      </Modal>
    </>
  );
};

export default UserManagement;
