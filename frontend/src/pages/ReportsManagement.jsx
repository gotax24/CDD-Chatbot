import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import useModalManager from "../hooks/useModalState";
import useAuth from "../hooks/useAuth";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import FormReportUpload from "../components/FormReportUpload";
import reportManage from "../assets/forms/reportManage.svg";
import "../CSS/Management.css";

const ReportsManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [idReport, setIdReport] = useState(null);
  const { isOpen, closeModal, openModal } = useModalManager();
  const { user } = useAuth();

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
        console.error(
          "Error al eliminar el archivo del almacenamiento:",
          storageError
        );
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
      <header className="header-management">
        <img
          className="icon-management"
          src={reportManage}
          alt="Icono de informe"
        />
        <h1 className="title-management">Gestión de informes</h1>
      </header>
      <main className="main-management">
        <button
          className="add-management"
          onClick={() => openModal("addReports")}
        >
          Agregar informe
        </button>
        <table className="table-management">
          <thead className="thead-management">
            <tr className="tr-management">
              <th className="th-management">ID del Informe</th>
              <th className="th-management">Nombre original</th>
              <th className="th-management">Tamaño del informe</th>
              <th className="th-management">Paciente</th>
              <th className="th-management">Cédula del Paciente</th>
              <th className="th-management">Teléfono del Paciente</th>
              <th className="th-management">Estado</th>
              <th className="th-management">Acción</th>
            </tr>
          </thead>
          <tbody className="tbody-mangement">
            {reports.map((report) => (
              <tr className="tr-management" key={report.id}>
                <td className="td-management">{report.id}</td>
                <td className="td-management">{report.original_filename}</td>
                <td className="td-management">
                  {(report.file_size / 1024).toFixed(2)} Kb
                </td>
                <td className="td-management">
                  {`${report.patient_first_name} ${report.patient_last_name}`}
                </td>
                <td className="td-management">{report.personal_id}</td>
                <td className="td-management">{report.phone_number}</td>
                <td className="td-management">{report.state}</td>
                {user?.profile?.role === "admin" && (
                  <>
                    <td className="td-management">
                      <button className="button-management">
                        Ver Detalles
                      </button>
                      <button
                        className="delete-management"
                        onClick={() => {
                          setIdReport(report.id);
                          openModal("deleteReport");
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </>
                )}
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
