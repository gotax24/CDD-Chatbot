import { Link } from "react-router-dom";
import img404 from "../assets/404.svg";
import "../CSS/Page404.css";

const Page404 = () => {
  return (
    <div className="page-404">
      <header className="header-404">
        <h1 className="title-404">Página no encontrada</h1>
        <p className="subtitle-404">
          Es posible que el enlace haya cambiado o no exista.
        </p>
      </header>
      <main className="main-404">
        <img
          src={img404}
          alt="Imagen de página no encontrada"
          className="img-404"
        />
        <p className="text-404">
          No te preocupes, puedes regresar fácilmente al inicio.
        </p>
        <Link to="/app/home" className="button-404">
          Volver a la página principal
        </Link>
      </main>
    </div>
  );
};

export default Page404;
