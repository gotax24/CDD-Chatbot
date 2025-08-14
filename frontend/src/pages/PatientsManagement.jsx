import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import useModalManager from "../hooks/useModalState";
import { supabase } from "../supabaseClient";
import Loading from "../components/Loading";
import Modal from "../components/Modal";

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

  if (loading) return <Loading />;

  return (
    <>
      <header>
        <span>icono</span>
        <h1>Gestión de informes</h1>
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
                <td>{patient.created_at}</td>
                <td>{`${patient.first_name} ${patient.last_name}`}</td>
                <td>{patient.personal_id}</td>
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
        closeModal={closeModal("addPatient")}
      >
        <AddFormPatient closeModal={closeModal("AddPatient")} />
      </Modal>
    </>
  );
};

export default PatientsManagement;
