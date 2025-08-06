import axios from "axios";
import { useForm } from "react-hook-form";

const ButtonAddUser = ({ closeModal, session }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  const createUser = async (data) => {
    console.log("🚀 Iniciando creación de usuario");
    console.log("📋 Datos del formulario:", data);
    console.log("🎫 Session:", session ? "✅ Presente" : "❌ Falta");
    console.log(
      "🔑 Access token:",
      session?.access_token ? "✅ Presente" : "❌ Falta"
    );

    try {
      const requestBody = {
        email: data.email,
        password: data.firstName + "123",
        username: data.username,
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role,
      };

      console.log("📦 Request body:", requestBody);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        // Agregar timeout para evitar peticiones colgadas
        timeout: 10000,
      };

      console.log("⚙️ Config headers:", config.headers);
      console.log(
        "🌐 Making request to:",
        "http://127.0.0.1:54321/functions/v1/create-user"
      );

      const response = await axios.post(
        "http://127.0.0.1:54321/functions/v1/create-user",
        requestBody,
        config
      );

      console.log("✅ Success response:", response.data);
      closeModal();
    } catch (error) {
      console.error("💥 Error completo:", error);
      console.error("📊 Error response:", error.response);
      console.error("📨 Error request:", error.request);
      console.error("⚙️ Error config:", error.config);

      let errorMessage = "Error desconocido";

      if (error.response) {
        // El servidor respondió con un error
        console.log(
          "🔴 Error del servidor:",
          error.response.status,
          error.response.data
        );
        errorMessage =
          error.response.data?.error ||
          error.response.data?.message ||
          `Error ${error.response.status}`;
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        console.log("🔴 Sin respuesta del servidor:", error.request);
        errorMessage = "Sin respuesta del servidor - verificar conexión";
      } else {
        // Error en la configuración de la petición
        console.log("🔴 Error de configuración:", error.message);
        errorMessage = error.message;
      }

      setError("root", {
        type: "manual",
        message: `Error al crear el usuario: ${errorMessage}`,
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

        <p className="disclaimer-modal">
          Cuando se crea un usuario, la contraseña será: (nombre)123
          <br />
          El usuario podrá cambiarla después.
        </p>
      </main>
    </>
  );
};

export default ButtonAddUser;
