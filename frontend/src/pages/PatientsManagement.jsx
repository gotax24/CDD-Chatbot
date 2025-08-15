import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import useModalManager from "../hooks/useModalState";
import { supabase } from "../supabaseClient";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import FormAddPatient from "../components/FormAddPatient";

const PatientsManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [idPatient, setIdPatient] = useState(null);
  const { isOpen, openModal, closeModal } = useModalManager();

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
      <header>
        <span>icono</span>
        <h1>Gestión de paciente</h1>
      </header>
      <main>
        <button onClick={() => openModal("addPatient")}>
          Agregar paciente
        </button>
        <table>
          <thead>
            <tr>
              <th>ID del paciente</th>
              <th>Fecha de su creacion</th>
              <th>Nombre y apellido</th>
              <th>Cédula del Paciente</th>
              <th>Correo</th>
              <th>Telefono</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.id}</td>
                <td>
                  {format(patient.created_at, "dd 'de' MMMM 'de' yyyy, HH:mm", {
                    locale: es,
                  })}
                </td>
                <td>{`${patient.first_name} ${patient.last_name}`}</td>
                <td>{patient.personal_id}</td>
                <td>{patient.email || "Null"}</td>
                <td>{patient.phone_number}</td>
                <td>
                  <button>Editar</button>
                  <button
                    onClick={() => {
                      openModal("deletePatient");
                      setIdPatient(patient.id);
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
              className="button-modal"
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
