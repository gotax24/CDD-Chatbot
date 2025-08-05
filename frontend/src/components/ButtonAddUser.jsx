import axios from "axios";
import { useForm } from "react-hook-form";
import useAuth from "../hooks/useAuth";

const ButtonAddUser = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  const { session } = useAuth();
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

  const createUser = async (data) => {
    try {
      const requestBody = {
        email: data.email,
        password: data.firstName + 123,
        username: data.username,
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role,
      };

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      };

      const response = await axios.post(
        `${SUPABASE_URL}/functions/v1/create-user`,
        requestBody,
        config
      );

      console.log("Usuario creado con éxito:", response.data);
    } catch (error) {
      console.error(
        "Error al crear el usuario con Axios:",
        error.response?.data || error.message
      );
      setError("axios", {
        type: "manual",
        message:
          "Error al crear el usuario con Axios: " + error.response?.data ||
          error.message,
      });
    }
  };

  return (
    <>
      <header>
        <span>icono</span>
        <h1>Agregar usuario</h1>
      </header>
      <main>
        <form onSubmit={handleSubmit(createUser)}>
          <div className="div-modal">
            <label className="label-modal">
              Nombre:
              <input
                type="text"
                className="input-modal"
                {...register("firstName", {
                  required: "El nombre esta vacio",
                  pattern: {
                    value: /^[A-Za-záéíóúÁÉÍÓÚ\s]+$/,
                    message: "El nombre solo puede tener letras",
                  },
                  minLength: {
                    value: 3,
                    message: "El nombre debe de tener mas de 3 letras",
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
                  required: "El apellido esta vacio",
                  pattern: {
                    value: /^[A-Za-záéíóúÁÉÍÓÚ\s]+$/,
                    message: "El nombre solo puede tener letras",
                  },
                  minLength: {
                    value: 5,
                    message: "El nombre debe de tener mas de 3 letras",
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
                type="text"
                className="input-modal"
                {...register("email", {
                  required: "El apellido esta vacio",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "El nombre solo puede tener letras",
                  },
                  minLength: {
                    value: 3,
                    message: "El nombre debe de tener mas de 3 letras",
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
                  required: "El apellido esta vacio",
                  pattern: {
                    value: "",
                    message: "El nombre solo puede tener letras",
                  },
                  minLength: {
                    value: 3,
                    message: "El nombre debe de tener mas de 3 letras",
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
                {...register("role", {
                  required: "Debe seleccionar uno",
                })}
              >
                <option value="" selected>
                  -Seleccionar-
                </option>
                <option value="admin">Admin</option>
                <option value="sender">Sender</option>
                <option value="viewer">Viewer</option>
              </select>
            </label>
            {errors.rol && (
              <span className="error-modal">{errors.rol.message}</span>
            )}
          </div>

          <button className="button-modal" disabled={isSubmitting}>
            {isSubmitting ? "Agregando.." : "Agregar usuario"}
          </button>

          {errors.axios && (
            <span className="error-modal">{errors.axios.message}</span>
          )}
        </form>
        <p className="disclaimer-modal">
          Cuando se crea un usuario la contraseña siempre sera el (nombre)123.
          <br />
          Despues el usuario lo puede cambiar
        </p>
      </main>
    </>
  );
};

export default ButtonAddUser;
