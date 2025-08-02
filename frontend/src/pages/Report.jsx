import { useForm } from "react-hook-form";

const Report = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <>
      <header>
        <h1>Envio de informes </h1>
      </header>
      <main>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
            ID
            <input
              type="text"
              {...register("id", {
                required: "El ID es obligatorio",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "El ID solo puede contener números",
                },
              })}
            />
          </label>
          <label>
            Nombre del paciente:
            <input
              type="text"
              {...register("first_name", {
                required: "El nombre es obligatorio",
                maxLength: {
                  value: 20,
                  message: "El nombre no puede exceder los 20 caracteres",
                },
                pattern: {
                  value: /^[A-Za-z]+$/,
                  message: "El nombre solo puede contener letras",
                },
              })}
            />
          </label>
          <label htmlFor="last_name">Apellido del paciente:</label>
          <input
            type="text"
            {...register("last_name", {
              required: "El apellido es obligatorio",
              maxLength: {
                value: 20,
                message: "El apellido no puede exceder los 20 caracteres",
              },
              pattern: {
                value: /^[A-Za-z]+$/,
                message: "El apellido solo puede contener letras",
              },
            })}
          />
          <label>
            Numero de telefono:
            <select name="code" id="code">
              <option value="0424">0424</option>
              <option value="0414">0414</option>
              <option value="0412">0412</option>
              <option value="0422">0422</option>
              <option value="0416">0416</option>
              <option value="0426">0426</option>
            </select>
            <input
              type="tel"
              {...register("phone", {
                required: "El número de teléfono es obligatorio",
                pattern: {
                  value: /^[0-9]{7}$/,
                  message: "El número de teléfono debe contener 7 dígitos",
                },
                maxLength: {
                  value: 7,
                  message:
                    "El número de teléfono no puede exceder los 7 dígitos",
                },
              })}
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              {...register("email", {
                required: "El email es obligatorio",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "El email no es válido",
                },
              })}
            />
          </label>
          <button>Enviar informe</button>
        </form>
      </main>
    </>
  );
};

export default Report;
