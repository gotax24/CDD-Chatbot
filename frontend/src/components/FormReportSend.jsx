import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { useForm } from "react-hook-form";
import { supabase } from "../supabaseClient";
import useModalManager from "../hooks/useModalState";

const FormReportSend = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();
  const { user } = useAuth();
  const { isOpen, closeModal, openModal } = useModalManager();
  const [patient, setPatient] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReportInSupabase = async () => {
      const { data, error } = await supabase.from("").select("*");
      if (error) {
        console.error("Error al traer los informes ", error);
        console.log(error);
        return;
      }

      setReports(data);
      console.log("Informes traidos correctamente");
    };

    fetchReportInSupabase();
  }, []);

  const sendReport = async (formData) => {
    console.log(formData);

    const cardId = `${formData.letterPersonalId}${formData.numberPersonalId}`;

    const { data: patient, error: errorPatient } = await supabase
      .from("patient")
      .select("*")
      .eq("id", cardId);

    if (errorPatient) {
      console.error(errorPatient);
      console.log("error al obtener el paciente" + errorPatient);

      return;
    }

    setPatient(patient);
    console.log("El paciente obtenido exitosamente");

    const { data, error } = await supabase.invoke("send-report", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: `58${patient.numberPhone}`,
        pdf_url: reports.path,
        name: `${patient.name}${patient.lastName}`,
      }),
    });

    if (error) {
      console.error(error);
      console.error("Error al enviar el informe por ws" + error.message);
      setError("Error al enviar el mensaje por ws");
      return;
    }

    console.log(data);
    console.log("Se logro venezuela");
  };

  return (
    <>
      <header className="header-modal">
        <span className="icon-modal">icono</span>
        <h1 className="title-modal">Enviar informes WhatsApp</h1>
      </header>
      <main className="main-modal">
        <form className="form-modal" onSubmit={handleSubmit(sendReport)}>
          <div className="div-modal">
            <label className="label-modal">
              *Documento de identidad del paciente
              <select
                {...register("letterPersonalId", {
                  required: "Debe seleccionar un tipo de documento",
                  validate: (value) =>
                    value !== "-" || "Debe seleccionar un tipo válido",
                })}
              >
                <option value="-">-Seleccionar-</option>
                <option value="V">V</option>
                <option value="J">J</option>
                <option value="P">P</option>
              </select>
              <input
                type="text"
                className="input-modal"
                {...register("numberPersonalId", {
                  required: "El numero del documento esta vacio",
                  pattern: {
                    value: /^[0-9]{6,8}$/,
                    message: "Debe tener entre 6 y 8 números",
                  },
                })}
              />
            </label>
            {(errors.letterPersonalId || errors.numberPersonalId) && (
              <span className="error-modal">
                {errors.letterPersonalId?.message ||
                  errors.numberPersonalId?.message}
              </span>
            )}
          </div>

          {patient ? (
            <div className="div-modal">
              <h2 className="subtitle-patient">Paciente encontrado: </h2>
              <p className="data-patient">
                {patient.name}
                {patient.lastName}
              </p>
              <p className="cardId-patient">{patient.personalId}</p>
              <p className="numberPhone-patient">{patient.numberPhone}</p>
            </div>
          ) : (
            <div className="div-modal">
              <h2> Paciente no encontrado</h2>
            </div>
          )}

          <div className="div-modal">
            <label className="label-modal">Informes a enviar</label>
            <button onClick={() => openModal("reports")}>
              Elegir informe/s
            </button>
          </div>

          <button disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar informes"}
          </button>
        </form>
      </main>

      <Modal
        isOpen={isOpen("reports")}
        closeModal={() => closeModal("reports")}
      >
        <ol>
          {reports.map((report) => {
            return <li key={report.id}>{report.title}</li>;
          })}
        </ol>
      </Modal>
    </>
  );
};

export default FormReportSend;
