import { useForm } from "react-hook-form";
import { supabase } from "../supabaseClient";

const FormAddPatient = ({ closeModal, updateList }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  const addPatient = async (formData) => {
    console.log(formData);

    const patientId = `${formData.letterPersonalId}${formData.numberPersonalId}`;

    const patientData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      personal_id: patientId,
      email: formData.email || null,
      phone_number: parseInt(formData.phoneNumber),
    };

    const { data, error } = await supabase
      .from("patients")
      .insert(patientData)
      .select()
      .single();

    if (error) {
      console.error(error.message);
      setError("root", {
        type: "manual",
        message: `Error: ${error.message}`,
      });
      return;
    }

    console.log("Paciente agregado: ", data);
    updateList(data);
    closeModal();
  };

  return (
    <>
      <header className="header-modal">
        <span className="icon-modal">icono</span>
        <h1 className="title-modal">Agregar paciente</h1>
      </header>
      <main className="main-modal">
        <form className="form-modal" onSubmit={handleSubmit(addPatient)}>
          <div className="div-modal">
            <label className="label-modal">
              *Nombre:
              <input
                type="text"
                className="input-modal"
                {...register("firstName", {
                  required: "El nombre está vacío",
                  pattern: {
                    value: /^[A-Za-záéíóúÁÉÍÓÚ\s]+$/,
                    message: "El nombre solo puede tener letras",
                  },
                  minLength: {
                    value: 2,
                    message: "El nombre debe tener al menos 2 letras",
                  },
                })}
              />
            </label>
            {errors.firstName && (
              <span className="error-modal">{errors.firstName.message}</span>
            )}
          </div>

          <div className="div-modal">
            <label className="label-modal">
              *Apellido:
              <input
                type="text"
                className="input-modal"
                {...register("lastName", {
                  required: "El apellido está vacío",
                  pattern: {
                    value: /^[A-Za-záéíóúÁÉÍÓÚ\s]+$/,
                    message: "El apellido solo puede tener letras",
                  },
                  minLength: {
                    value: 2,
                    message: "El apellido debe tener al menos 2 letras",
                  },
                })}
              />
            </label>
            {errors.lastName && (
              <span className="error-modal">{errors.lastName.message}</span>
            )}
          </div>

          <div className="div-modal">
            <label className="label-modal">
              *Documento de identificacion
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

          <div className="div-modal">
            <label className="label-modal">
              Correo:
              <input
                type="email"
                className="input-modal"
                placeholder="opcional"
                {...register("email", {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Ingrese un correo válido",
                  },
                })}
              />
            </label>
            {errors.email && (
              <span className="error-modal">{errors.email.message}</span>
            )}
          </div>
          <div className="div-modal">
            <label className="label-modal">
              *Numero de telefono:
              <input
                type="number"
                className="input-modal"
                {...register("phoneNumber", {
                  required: "El numero esta vacio",
                  pattern: {
                    value: /^[0-9]{10,11}$/,
                    message: "Debe tener 10 u 11 números (ej: 04141234567)",
                  },
                })}
              />
            </label>
            {errors.email && (
              <span className="error-modal">{errors.phoneNumber.message}</span>
            )}
          </div>
          <button className="button-modal" disabled={isSubmitting}>
            {isSubmitting ? "Agregando..." : "Agregar al paciente"}
          </button>
        </form>
      </main>
    </>
  );
};

export default FormAddPatient;
