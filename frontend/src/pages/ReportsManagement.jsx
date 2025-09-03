import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import useModalManager from "../hooks/useModalState";
import FormReportUpload from "../components/FormReportUpload";

const ReportsManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [idReport, setIdReport] = useState(null);
  const { isOpen, closeModal, openModal } = useModalManager();

  useEffect(() => {
    setLoading(true);
    const getReports = async () => {
      const { data, error } = await supabase
        .from("medical_reports_view")
        .select("*");

      if (error) {
        console.error("Error al obtener informes:", error.message);
        setLoading(false);
      } else {
        setReports(data);
      }
      
      setLoading(false);
    };

    getReports();
  }, []);

  if (loading) return <Loading />;

  const handleReportsAdded = (newReport) => {
    setReports((prev) => [...prev, newReport]);
  };

  const handleCloseDeleteModal = () => {
    setIdReport(null);
    closeModal("deleteReport");
  };

  const deleteReport = async (id) => {
    setDeleting(true);
    try {
      const { data, error } = await supabase
        .from("medical_reports")
        .delete()
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      console.log("Informe eliminado", data);
      setReports((prev) => prev.filter((r) => r.id !== id));

      const { error: storageError } = await supabase.storage
        .from("medical-reports")
        .remove([data.route]);

      if (storageError) {
        console.error("Error al eliminar el archivo del almacenamiento:", storageError);
      } else {
        console.log("Archivo eliminado del almacenamiento");
      }

      setDeleting(false);
      handleCloseDeleteModal();
    } catch (error) {
      setDeleting(false);
      const errorMessage = error.context?.body?.error || error.message;

      console.error("Error al eliminar informe:", errorMessage);
    }
  };

  return (
    <>
      <header>
        <span>icono</span>
        <h1>Gestión de informes</h1>
      </header>
      <main>
        <button onClick={() => openModal("addReports")}>Agregar informe</button>
        <table>
          <thead>
            <tr>
              <th>ID del Informe</th>
              <th>Nombre original</th>
              <th>Tamaño del informe</th>
              <th>Paciente</th>
              <th>Cédula del Paciente</th>
              <th>Teléfono del Paciente</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.id}</td>
                <td>{report.original_filename}</td>
                <td>{(report.file_size / 1024).toFixed(2)} Kb</td>
                <td>
                  {`${report.patient_first_name} ${report.patient_last_name}`}
                </td>
                <td>{report.personal_id}</td>
                <td>{report.phone_number}</td>
                <td>{report.state}</td>
                <td>
                  <button>Ver Detalles</button>
                  <button
                    onClick={() => {
                      setIdReport(report.id, );
                      openModal("deleteReport");
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
        isOpen={isOpen("addReports")}
        closeModal={() => closeModal("addReports")}
      >
        <FormReportUpload
          closeModal={() => closeModal("addReports")}
          updateList={handleReportsAdded}
        />
      </Modal>

      <Modal
        isOpen={isOpen("deleteReport")}
        closeModal={handleCloseDeleteModal}
      >
        <>
          <header className="header-modal">
            <span className="icon-modal">icono</span>
            <h1 className="title-modal">Eliminar Informe</h1>
          </header>
          <main className="main-modal">
            <h2 className="confirm-modal">
              Estas seguro de eliminar el Informe?
            </h2>
            <button
              className="button-modal"
              disabled={deleting}
              onClick={() => deleteReport(idReport)}
            >
              {deleting ? "Eliminando..." : "Confirmar"}
            </button>
          </main>
        </>
      </Modal>
    </>
  );
};

export default ReportsManagement;
