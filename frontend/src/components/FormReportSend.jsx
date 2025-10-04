import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../supabaseClient";
import useAuth from "../hooks/useAuth";
import useModalManager from "../hooks/useModalState";
import Modal from "./Modal";
import reportSend from "../assets/forms/ReportSend.svg";
import "../CSS/FormReportSend.css";

const FormReportSend = ({ closeModal: closeModalFather }) => {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const { isOpen, openModal, closeModal } = useModalManager();
  const [patient, setPatient] = useState(null);
  const [selectedReports, setSelectedReports] = useState([]);
  const [reports, setReports] = useState([]);
  const [result, setResult] = useState(null);

  // Buscar paciente y traer sus informes
  const getPatientAndReports = async (formData) => {
    const cardId = `${formData.letterPersonalId}${formData.numberPersonalId}`;

    try {
      // Buscar paciente
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("personal_id", cardId)
        .single();

      if (patientError || !patientData) {
        console.error(patientError);
        setPatient(null);
        setReports([]);
        setResult({ success: false, error: "Paciente no encontrado" });
        return;
      }

      console.log(patientData);
      setPatient(patientData);

      // Buscar informes asociados
      const { data: reportsData, error: reportsError } = await supabase
        .from("medical_reports")
        .select("*")
        .eq("card_id", patientData.personal_id);

      if (reportsError) throw reportsError;

      setReports(reportsData);
      setResult(null);
    } catch (err) {
      console.error(err);
      setResult({
        success: false,
        error: "Error al obtener datos del paciente",
      });
    }
  };

  // Enviar informes seleccionados
  const sendReports = async () => {
    if (!patient || selectedReports.length === 0) {
      setResult({
        success: false,
        error: "Debes seleccionar al menos un informe",
      });
      return;
    }

    console.log(selectedReports);
    console.log(reports);

    try {
      const { data, error } = await supabase.functions.invoke("send-report", {
        body: {
          patientId: patient.id,
          reportIds: selectedReports,
          senderId: user.profile.id,
        },
      });

      if (error) throw error;

      setResult({ success: true, data });
      closeModalFather("reportSend");
    } catch (err) {
      console.error(err);
      setResult({ success: false, error: err.message });
    }
  };

  return (
    <>
      <header className="header-modal">
        <img className="icon-modal" src={reportSend} alt="Icono de envio de reporte" />
        <h1 className="title-modal">Enviar informes por WhatsApp</h1>
      </header>

      <main className="main-modal">
        {/* Formulario de búsqueda */}
        <form
          className="form-modal"
          onSubmit={handleSubmit(getPatientAndReports)}
        >
          <label className="label-modal-send">
            Documento de identidad:
            <select className="select-modal" {...register("letterPersonalId", { required: true })}>
              <option value="">-</option>
              <option value="V">V</option>
              <option value="J">J</option>
              <option value="P">P</option>
            </select>
            <input
            className="input-modal"
              type="text"
              placeholder="Número"
              {...register("numberPersonalId", {
                required: "Campo obligatorio",
                pattern: { value: /^[0-9]{6,8}$/, message: "6 a 8 dígitos" },
              })}
            />
          </label>

          {errors.numberPersonalId && (
            <span className="error">{errors.numberPersonalId.message}</span>
          )}
          <button className="button-modal" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Buscando..." : "Buscar paciente"}
          </button>
        </form>

        {/* Mostrar paciente */}
        {patient && (
          <div className="patient-info">
            <h2 className="subtitle-modal">Paciente encontrado:</h2>
            <p className="patient-name">
              {patient.name} {patient.lastName}
            </p>
            <p className="id-patient">CI: {patient.personal_id}</p>
            <p className="cellphone-patient">Tel: {patient.phone_number}</p>
            <button className="button-modal" type="button" onClick={() => openModal("reports")}>
              Elegir informes
            </button>
          </div>
        )}

        {/* Resultado de envío */}
        {result && (
          <div className={result.success ? "success" : "error"}>
            {result.success
              ? "✅ Informe enviado correctamente"
              : `❌ ${result.error}`}
          </div>
        )}
      </main>

      {/* Modal para seleccionar informes */}
      <Modal
        isOpen={isOpen("reports")}
        closeModal={() => closeModal("reports")}
      >
        {reports.length > 0 ? (
          <div className="reports-selection">
            <h3 className="subtitle-modal">Selecciona informes</h3>
            {reports.map((report) => (
              <label
              className="label-modal"
                key={report.id}
              >
                <input
                className="checkbox-modal"
                  type="checkbox"
                  checked={selectedReports.includes(report.id)}
                  onChange={(e) => {
                    setSelectedReports((prev) =>
                      e.target.checked
                        ? [...prev, report.id]
                        : prev.filter((id) => id !== report.id)
                    );
                  }}
                />
                {report.id} - {report.original_filename || "Informe sin nombre"}
              </label>
            ))}
            <button className="button-modal" onClick={sendReports}>Enviar</button>
          </div>
        ) : (
          <p className="no-reports">No hay informes para este paciente</p>
        )}
      </Modal>
    </>
  );
};

export default FormReportSend;
