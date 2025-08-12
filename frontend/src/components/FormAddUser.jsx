import { useForm } from "react-hook-form";
import { supabase } from "../supabaseClient";

const FormAddUser = ({ closeModal }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  const createUser = async (formData) => {
    try {
      const { data, error } = await supabase.functions.invoke("invite-user", {
        body: {
          email: formData.email,
          username: formData.username,
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: formData.role,
        },
      });

      if (error) throw error;

      console.log("✅ Success response:", data);
      closeModal();
    } catch (error) {
      const errorMessage = error.context?.body?.error || error.message;

      console.error("Error al invocar la función:", errorMessage);
      setError("root", {
        type: "manual",
        message: `Error: ${errorMessage}`,
      });
    }
  };

  return (
    <>
      <header className="header-modal">
        <span className="icon-modal">icono</span>
        <h1 className="title-modal">Agregar usuario</h1>
      </header>
      <main className="main-modal">
        <form className="form-modal" onSubmit={handleSubmit(createUser)}>
          <div className="div-modal">
            <label className="label-modal">
              Nombre:
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
              Apellido:
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
              Correo:
              <input
                type="email"
                className="input-modal"
                {...register("email", {
                  required: "El correo está vacío",
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
              Username:
              <input
                type="text"
                className="input-modal"
                {...register("username", {
                  required: "El username está vacío",
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message:
                      "Username solo puede contener letras, números y guiones bajos",
                  },
                  minLength: {
                    value: 3,
                    message: "El username debe tener al menos 3 caracteres",
                  },
                  maxLength: {
                    value: 20,
                    message: "El username no puede tener más de 20 caracteres",
                  },
                })}
              />
            </label>
            {errors.username && (
              <span className="error-modal">{errors.username.message}</span>
            )}
          </div>

          <div className="div-modal">
            <label className="label-modal">
              Rol:
              <select
                className="input-modal"
                {...register("role", {
                  required: "Debe seleccionar un rol",
                })}
                defaultValue=""
              >
                <option value="">-Seleccionar-</option>
                <option value="admin">Admin</option>
                <option value="sender">Sender</option>
                <option value="viewer">Viewer</option>
              </select>
            </label>
            {errors.role && (
              <span className="error-modal">{errors.role.message}</span>
            )}
          </div>

          <button
            className="button-modal"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creando..." : "Crear usuario"}
          </button>

          {errors.root && (
            <span className="error-modal">{errors.root.message}</span>
          )}
        </form>
      </main>
    </>
  );
};

export default FormAddUser;
