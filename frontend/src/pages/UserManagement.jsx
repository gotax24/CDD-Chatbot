import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import useAuth from "../hooks/useAuth";
import useModalState from "../hooks/useModalState";
import Modal from "../components/Modal";
import FormAddUser from "../components/FormAddUser";
import Loading from "../components/Loading";
import FormEditUser from "../components/FormEditUser";
import userManagement from "../assets/forms/user.svg";
import "../CSS/Management.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
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

    if (idUser.includes("aa27a4f5-")) {
      setError("No puedes eliminar este usuario");
      setDeleting(false);
      return;
    }

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
      <header className="header-management">
        <img className="icon-management" src={userManagement} alt="" />
        <h1 className="title-management">Gestión de usuarios</h1>
      </header>
      <main className="main-management">
        <button className="add-management" onClick={() => openModal("addUser")}>
          Agregar Usuario
        </button>
        <table className="table-management">
          <thead className="thead-management">
            <tr className="tr-management">
              <th className="th-management">ID</th>
              <th className="th-management">Email</th>
              <th className="th-management">Username</th>
              <th className="th-management">Nombre y Apellido</th>
              <th className="th-management">Rol</th>
              <th className="th-management">Acciones</th>
            </tr>
          </thead>
          <tbody className="tbody-management">
            {users.map((user) => (
              <tr className="tr-management" key={user.id}>
                <td className="td-management">{user.id}</td>
                <td className="td-management">{user.email}</td>
                <td className="td-management">{user.username}</td>
                <td className="td-management">{`${user.first_name} ${user.last_name}`}</td>
                <td className="td-management">{user.role}</td>
                <td className="td-management">
                  <button className="button-management">Editar</button>
                  <button
                    className="delete-management"
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
              className="button-modal-delete"
              disabled={deleting}
              onClick={() => deleteUser(idUser)}
            >
              {deleting ? "Eliminando..." : "Confirmar"}
            </button>
            {error && <p className="error-modal">{error}</p>}
          </main>
        </>
      </Modal>
    </>
  );
};

export default UserManagement;
