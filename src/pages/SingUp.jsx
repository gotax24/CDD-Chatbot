import supabase from "./supabaseClient.jsx";
import { useForm } from "react-hook-form";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const { data: dataSupa, error } = supabase.auth.singUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          username: data.username,
        },
      },
    });
  };

  return (
    <>
      <header>
        <img src="" alt="Logo de CDD Maracaibo" />
        <h1>Registrate a CDD Maracaibo - Chatbot</h1>
        <h2>+tecnologia +inovacion +medicina</h2>
      </header>
      <main>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
            Email:
            <input
              type="email"
              placeholder="ejemplo@ejamplo.com"
              {...register("email", {
                pattern: "",
                required: "El email es obligatorio",
                minLength: {
                  value: 20,
                  message: "El email debe tener al menos 5 caracteres",
                },
              })}
            />
          </label>
        </form>
      </main>
    </>
  );
};

export default Login;
