import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient.js";
import { useForm } from "react-hook-form";
import useAuth from "../hooks/useAuth.jsx";

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
  const { session } = useAuth();

  // Si ya hay una sesión activa, redirigimos al usuario a la página de inicio
  if (session) {
    return navigate("/app/home");
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
        setError("root", {
          type: "manual",
          message: "Error de autenticación. Por favor, inténtalo de nuevo.",
        });
        reset();
        return;
      }

      // Si el inicio de sesión es exitoso, puedes redirigir al usuario
      if (data.user) {
        navigate("/home");
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
      <header className="header-login">
        <img
          className="logo-login"
          src="/Logo-CDD-Radioterapia-Maracaibo-300px-Blanco.avif"
          alt="Logo de CDD Maracaibo"
        />
        <h1 className="title-login">Bienvenido a CDD Maracaibo</h1>
        <h2 className="subtitle-login">+Tecnologia +Inovacion +Medicina</h2>
      </header>
      <main className="main-login">
        <form className="form-login" onSubmit={handleSubmit(onSubmit)}>
          <label className="label-login">
            Email:
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
          </label>
          <label className="label-login">
            Contraseña:
            <input
              type="password"
              placeholder="********"
              className="input-login"
              {...register("password", {
                required: "La contraseña es obligatoria",
                minLength: {
                  value: 6,
                  message: "La contraseña debe tener al menos 6 caracteres",
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
                  message:
                    "La contraseña debe contener al menos una letra mayúscula, una minúscula y un número",
                },
              })}
            />
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </label>
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
        </form>
      </main>
    </>
  );
};

export default SignIn;
