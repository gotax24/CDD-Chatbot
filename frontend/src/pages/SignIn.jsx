import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient.js";
import { useForm } from "react-hook-form";
import useAuth from "../hooks/useAuth.jsx";
import "../CSS/SignIn.css";

const SignIn = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm();

  // Usamos Navigate para redirigir al usuario después de iniciar sesión
  const navigate = useNavigate();

  // Obtenemos la sesión actual del contexto de autenticación
  const { user } = useAuth();

  // Si ya hay una sesión activa, redirigimos al usuario a la página de inicio
  if (user.session) {
    navigate("/app/home");
  }
  // Función para manejar el envío del formulario
  const onSubmit = async (formData) => {
    try {
      // Aquí puedes manejar el inicio de sesión con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error("Error de autenticación:", error);
        setError("auth", {
          type: "manual",
          message: "Error de autenticación. Por favor, inténtalo de nuevo.",
        });
        reset();
        return;
      }

      // Si el inicio de sesión es exitoso, puedes redirigir al usuario
      if (data) {
        navigate("/app/home");
      }
    } catch (error) {
      // Manejo de errores en caso de que algo falle
      console.error("Error al iniciar sesión:", error);
      setError("root", {
        type: "manual",
        message: "Error al iniciar sesión. Por favor, inténtalo de nuevo.",
      });
    }
  };

  return (
    <>
      <main className="login-container">
        <div className="login-card">
          <header className="login-header">
            <img
              className="login-logo"
              src="./Logo-CDDmcbo.webp"
              alt="Logo de CDD Maracaibo"
            />
            <h1 className="login-title">Bienvenido al portal CDD Maracaibo</h1>
            <p className="login-subtitle">
              +Tecnología · +Innovación · +Medicina
            </p>
          </header>

          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="ejemplo@ejemplo.com"
                className="input-login"
                {...register("email", {
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "El email no es válido",
                  },
                  required: "El email es obligatorio",
                })}
              />
              {errors.email && (
                <span className="error-message">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="********"
                className="input-login"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                  minLength: {
                    value: 6,
                    message: "Debe tener al menos 6 caracteres",
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
                    message:
                      "Debe contener al menos una mayúscula, una minúscula y un número",
                  },
                })}
              />
              {errors.password && (
                <span className="error-message">{errors.password.message}</span>
              )}
            </div>

            <button
              className="button-login"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>

            {errors.root && (
              <span className="error-message">{errors.root.message}</span>
            )}
            {errors.auth && (
              <span className="error-message">{errors.auth.message}</span>
            )}
          </form>
        </div>
      </main>
    </>
  );
};

export default SignIn;
