import { useForm } from "react-hook-form";

const FormAddPatient = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  const addPatient = (formData) => {};

  return (
    <>
      <header className="header-modal">
        <span className="icon-modal">icono</span>
        <h1 className="title-modal">Agregar usuario</h1>
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
                  required: true,
                })}
              >
                <option value="-" selected>
                  -Seleccionar-
                </option>
                <option value="V">V</option>
                <option value="J">J</option>
                <option value="P">P</option>
              </select>
              <input
                type="text"
                className="input-modal"
                {...register("numberPersonalId", {
                  required: "El numero del documento esta vacio",
                })}
              />
            </label>
            {errors.letterPersonalId ||
              (errors.numberPersonalId && (
                <span className="error-modal">
                  {errors.letterPersonalId.message ||
                    errors.numberPersonalId.message}
                </span>
              ))}
          </div>

          <div className="div-modal">
            <label className="label-modal">
              Correo:
              <input
                type="email"
                className="input-modal"
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
        </form>
      </main>
    </>
  );
};

export default FormAddPatient;
