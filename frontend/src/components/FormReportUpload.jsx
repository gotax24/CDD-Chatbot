import { useForm } from "react-hook-form";
import { supabase } from "../supabaseClient";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import useAuth from "../hooks/useAuth";

const FormReportUpload = ({ closeModal, updateList }) => {
  const [patientData, setPatientData] = useState();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  const uploadReport = async (formData) => {
    const patientId = `${formData.letterPersonalId}${formData.numberPersonalId}`;
    const patientExists = await checkingExistingPatient(patientId);

    if (!patientExists) {
      setError("patientNotFound", {
        message: "Debe crear el paciente antes de subir informes",
      });
      return;
    }

    const file = formData.reports[0];
    console.log(file);
    //ruta
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const timestamp = now
      .toISOString()
      .replace(/[:.]/g, "")
      .replace("T", "_")
      .slice(0, 15);

    const route = `${year}/${month}/${patientId}_${timestamp}_${file.name}`;

    try {
      const { data: upload, error: uploadError } = await supabase.storage
        .from("medical-reports")
        .upload(route, file);

      if (uploadError) {
        console.error(`Error subiendo el informe: ${uploadError.message}`);
        setError("errorReport", {
          message: `Error subiendo el informe: ${uploadError.message}`,
        });
        return;
      }

      console.log(upload);

      const medicalReportData = {
        route: route,
        card_id: patientId,
        state: "active",
        created_by: user.profile.id,
        original_filename: file.name,
        file_size: file.size,
      };

      const { data: dbData, error: dbError } = await supabase
        .from("medical_reports")
        .insert([medicalReportData]);

      if (dbError) {
        console.error(dbError);
        await supabase.storage.from("medical-reports").remove([route]);
        setError("dbError", {
          message: `Error en la db: ${dbError.message}`,
        });

        return;
      }

      console.log("Informe registrado exitosamente:", dbData);
      updateList(dbData);
      closeModal();
    } catch (error) {
      console.error("Error general:", error.message);
      setError("root", {
        message: `Error inesperado al subir informe: ${error.message}`,
      });
    }
  };

  const checkingExistingPatient = async (patientId) => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, first_name, last_name, personal_id")
        .eq("personal_id", patientId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking patient:", error);
        return false;
      }

      if (data) {
        setPatientData(data);
        return true;
      } else {
        setPatientData(null);
        return false;
      }
    } catch (error) {
      console.error(`Error general: ${error.message}`);
      return false;
    }
  };

  return (
    <>
      <header className="header-modal">
        <span className="icon-modal">icono</span>
        <h1 className="title-modal">Subir informe</h1>
      </header>
      <main className="main-modal">
        <form className="form-modal" onSubmit={handleSubmit(uploadReport)}>
          <div className="div-modal">
            <label className="label-modal">
              Informe(PDF):
              <input
                type="file"
                accept=".pdf"
                {...register("reports", {
                  required: "El informe no esta seleccionado",
                  validate: {
                    fileType: (files) => {
                      if (files[0] && !files[0].type.includes("pdf")) {
                        return "Solo se permiten archivos PDF";
                      }
                      return true;
                    },
                    fileSize: (files) => {
                      if (files[0] && files[0].size > 10 * 1024 * 1024) {
                        return "El archivo no debe superar 10MB";
                      }
                      return true;
                    },
                  },
                })}
              />
              {errors.reports && (
                <span className="error-modal">{errors.reports.message}</span>
              )}
            </label>
          </div>
          <div className="div-modal">
            <label className="label-modal">
              Documento de identidad
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

          {patientData && (
            <>
              <div>
                <h3>✅ Paciente encontrado:</h3>
                <p>
                  <strong>
                    {patientData.first_name} {patientData.last_name}
                  </strong>
                </p>
                <p>Cédula: {patientData.personal_id}</p>
              </div>
            </>
          )}

          {errors.root && (
            <div className="error-modal">{errors.root.message}</div>
          )}

          <div className="error-modal">❌ {errors.patientNotFound}</div>

          <button disabled={isSubmitting}>
            {isSubmitting ? "Agregando..." : "Agregar el informe"}
          </button>
        </form>
      </main>
    </>
  );
};

export default FormReportUpload;
