import { Link } from "react-router-dom";
import ig from "../assets/footer/ig.svg";
import likendln from "../assets/footer/likendln.svg";
import whatsapp from "../assets/footer/whatsapp.svg";
import "../CSS/Footer.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-main">
      <div className="container">
        <div className="footer-header">
          <img
            src="/Logo-CDDmcbo.webp"
            alt="Logo de CDD Maracaibo"
            className="footer-logo"
          />
          <p className="footer-title">CDD Maracaibo</p>
        </div>

        <div className="container-links">
          <h3 className="footer-subtitle">Enlaces rápidos</h3>
          <ul className="list-links">
            <li className="links-item">
              <Link to="/app/reports">Enviar informes</Link>
            </li>
            <li className="links-item">
              <Link to="/app/admin/patients">Pacientes</Link>
            </li>
            <li className="links-item">
              <Link to="/app/admin/reports">Subir informes</Link>
            </li>
          </ul>
        </div>

        <div className="container-contact">
          <h3 className="footer-subtitle">Contactos</h3>
          <a
            href="https://maps.app.goo.gl/BZiDVP3Ff7YaBr1FA"
            target="_blank"
            rel="noreferrer"
            className="text-contact"
          >
            📍 Ubicacion
          </a>
          <p className="text-contact">📧 cddmaracaibo@gmail.com</p>
          <p className="text-contact">📞 +584140674354</p>
        </div>

        <div className="container-social-media">
          <h3 className="footer-subtitle">Síguenos</h3>
          <div className="social-media-icons">
            <a
              href="https://www.instagram.com/cddmaracaibo/"
              target="_blank"
              rel="noreferrer"
              className="icon-social-media"
            >
              <img className="social-media" src={ig} alt="Logo de instagram" />
            </a>
            <a
              href="https://www.linkedin.com/company/grupocddglobal/?originalSubdomain=do"
              target="_blank"
              rel="noreferrer"
              className="icon-social-media"
            >
              <img
                className="social-media"
                src={likendln}
                alt="Logo de likendln"
              />
            </a>
            <a
              href="https://wa.me/584246481190"
              target="_blank"
              rel="noreferrer"
              className="icon-social-meida"
            >
              <img
                className="social-media"
                src={whatsapp}
                alt="Logo de whatsapp"
              />
            </a>
          </div>
        </div>
      </div>

      <div className="container-credits">
        <p className="text-credits">
          &copy; {year} CDD Maracaibo | Desarrollado por Ing. Ernesto Bracho R.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
