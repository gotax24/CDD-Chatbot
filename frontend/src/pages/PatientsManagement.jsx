//react y librerias
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import useModalManager from "../hooks/useModalState";
import { supabase } from "../supabaseClient";
import useAuth from "../hooks/useAuth";
//componentes
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import FormAddPatient from "../components/FormAddPatient";
//assets
import patient from "../assets/forms/patient.svg";
//css
import "../CSS/Management.css"

const PatientsManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [idPatient, setIdPatient] = useState(null);
  const { isOpen, openModal, closeModal } = useModalManager();
  const { user } = useAuth();

  useEffect(() => {
    const getPatients = async () => {
      let { data: patients, error } = await supabase
        .from("patients")
        .select("*");
      if (error) {
        console.error("error de supabase: " + error.message);
        setLoading(false);
        return;
      } else {
        setPatients(patients);
        console.log("query exitosa: ", patients);
      }
      setLoading(false);
    };

    getPatients();
  }, []);

  const handlePatientAdded = (newPatient) => {
    setPatients((prevPatients) => [...prevPatients, newPatient]);
  };

  const deletePatient = async (id) => {
    setDeleting(true);
    const { error } = await supabase.from("patients").delete().eq("id", id);

    setDeleting(false);
    setPatients((prev) => prev.filter((u) => u.id !== idPatient));
    closeModal("deletePatient");
    return { error };
  };

  if (loading) return <Loading />;

  return (
    <>
      <header className="header-management">
        <img
          className="icon-management"
          src={patient}
          alt="Icono de un hospital"
        />
        <h1 className="title-management">Gestión de paciente</h1>
      </header>
      <main className="main-management">
        <button
          className="add-management"
          onClick={() => openModal("addPatient")}
        >
          Agregar paciente
        </button>
        <table className="table-management">
          <thead className="thead-management">
            <tr className="tr-management">
              <th className="th-management">ID del paciente</th>
              <th className="th-management">Fecha de su creacion</th>
              <th className="th-management">Nombre y apellido</th>
              <th className="th-management">Cédula del Paciente</th>
              <th className="th-management">Correo</th>
              <th className="th-management">Telefono</th>
              {user?.profile?.role === "admin" && (
                <th className="th-management">Acción</th>
              )}
            </tr>
          </thead>
          <tbody className="tbody-management">
            {patients.map((patient) => (
              <tr className="tr-management" key={patient.id}>
                <td className="td-management">{patient.id}</td>
                <td className="td-management">
                  {format(patient.created_at, "dd 'de' MMMM 'de' yyyy, HH:mm", {
                    locale: es,
                  })}
                </td>
                <td className="td-management">{`${patient.first_name} ${patient.last_name}`}</td>
                <td className="td-management">{patient.personal_id}</td>
                <td className="td-management">{patient.email || "Null"}</td>
                <td className="td-management">{patient.phone_number}</td>
                {user?.profile?.role === "admin" && (
                  <td className="td-management">
                    <button
                      className="delete-management"
                      onClick={() => {
                        openModal("deletePatient");
                        setIdPatient(patient.id);
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      <Modal
        isOpen={isOpen("addPatient")}
        closeModal={() => closeModal("addPatient")}
      >
        <FormAddPatient
          closeModal={() => closeModal("addPatient")}
          updateList={handlePatientAdded}
        />
      </Modal>

      <Modal
        isOpen={isOpen("deletePatient")}
        closeModal={() => closeModal("deletePatient")}
      >
        <>
          <header className="header-modal">
            <span className="icon-modal">icono</span>
            <h1 className="title-modal">Eliminar paciente</h1>
          </header>
          <main className="main-modal">
            <h2 className="confirm-modal">
              Estas seguro de eliminar el paciente?
            </h2>
            <button
              className="button-modal-delete"
              disabled={deleting}
              onClick={() => deletePatient(idPatient)}
            >
              {deleting ? "Eliminando..." : "Confirmar"}
            </button>
          </main>
        </>
      </Modal>
    </>
  );
};

export default PatientsManagement;
