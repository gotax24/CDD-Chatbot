import { Link } from "react-router-dom";

const Page404 = () => {
  return (
    <>
      <h1>Pagina no encontrada Error 404 </h1>
      <p>Parece que estas perdido</p>
      <Link to="/app/home">Volver a la página de inicio</Link>
    </>
  );
};

export default Page404;